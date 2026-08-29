import apiClient from './apiClient';
import { FieldTeam, MaintenanceWorkOrder } from '../types';
import { reverseGeocode } from '../utils/location';

const assetUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return value.startsWith('/') ? value : `/${value.replace(/\\/g, '/')}`;
};

export interface MaterialsUsed {
  coldMixBags: number;
  asphaltKg: number;
  concreteKg: number;
  compactorMinutes: number;
  otherMaterials: { name: string; quantity: number; unit: string }[];
}

export interface TeamMessage {
  id: string;
  teamId: string;
  sender: string;
  message: string;
  createdAt: string;
}

const mapBackendTeam = (t: any): FieldTeam => ({
  id: t._id,
  name: t.name,
  callsign: t.callsign,
  status: t.status,
  membersCount: t.membersCount ?? 0,
  leadName: t.leadName || 'Not configured',
  locationName: t.locationName || 'Location unavailable',
  coordinates: t.coordinates || { lat: 0, lng: 0 },
  currentTask: t.currentTask || 'No active task',
  currentWorkOrderId: t.currentWorkOrderId?._id || t.currentWorkOrderId || undefined,
  etaMin: t.etaMin ?? 0,
  equipment: Array.isArray(t.equipment) ? t.equipment : [],
  batteryPct: t.batteryPct ?? 0,
  vehiclePlate: t.vehiclePlate || 'Not configured',
  vehicleType: t.vehicleType || 'Not configured',
  shiftHours: t.shiftHours || 'Not configured',
  todayCompletedCount: t.todayCompletedCount ?? 0,
});

export const getFieldTeams = async (): Promise<FieldTeam[]> => {
  const res = await apiClient.get('/field-teams');
  return (res.data?.data || []).map(mapBackendTeam);
};

export const getFieldTeamById = async (teamId: string): Promise<FieldTeam> => {
  const res = await apiClient.get(`/field-teams/${teamId}`);
  return mapBackendTeam(res.data.data);
};

export const updateFieldTeamStatus = async (
  teamId: string,
  updates: Partial<Pick<FieldTeam, 'status' | 'locationName' | 'coordinates' | 'currentTask' | 'etaMin' | 'batteryPct'>>
): Promise<FieldTeam> => {
  const res = await apiClient.patch(`/field-teams/${teamId}/status`, updates);
  return mapBackendTeam(res.data.data);
};

const BACKEND_TO_UI_STATUS: Record<string, MaintenanceWorkOrder['status']> = {
  REPORTED: 'Assigned', AI_VERIFIED: 'Assigned', ASSIGNED: 'Assigned',
  EN_ROUTE: 'En Route', ON_SITE: 'On Site', WORK_IN_PROGRESS: 'Repairing',
  INSPECTION: 'Inspection', RESOLVED: 'Completed',
};

const UI_TO_BACKEND_STATUS: Record<MaintenanceWorkOrder['status'], string> = {
  Assigned: 'ASSIGNED', 'En Route': 'EN_ROUTE', 'On Site': 'ON_SITE',
  Repairing: 'WORK_IN_PROGRESS', Inspection: 'INSPECTION', Completed: 'RESOLVED',
};

const priorityFromComplaint = (item: any): MaintenanceWorkOrder['priority'] => {
  const bySeverity: Record<string, MaintenanceWorkOrder['priority']> = {
    CRITICAL: 'P1', HIGH: 'P2', MEDIUM: 'P3', LOW: 'P4',
  };
  return bySeverity[item.severity] || 'P3';
};

export const mapComplaintToWorkOrder = async (item: any): Promise<MaintenanceWorkOrder> => {
  const priority = priorityFromComplaint(item);
  let address = item.location?.address || 'Location unavailable';
  const coords = item.location?.coordinates;
  if (coords?.length === 2 && (!item.location?.address || address === 'Location unavailable')) {
    try {
      const geo = await reverseGeocode(coords[1], coords[0]);
      address = geo.address || geo.city || address;
    } catch { /* keep backend value */ }
  }
  const team = item.assigned_team_id;
  const recommendation = item.ai_recommendation || {};
  const plan = item.repair_plan || {};
  const used = item.materials_used || {};

  return {
    id: item._id,
    reportId: item._id,
    roadName: String(item.road_name || item.defect_type || 'Infrastructure defect').replace(/_/g, ' '),
    location: address,
    defectType: String(item.defect_type || 'OTHER').toLowerCase() as MaintenanceWorkOrder['defectType'],
    department: item.assigned_department_id?.name || 'Unassigned',
    priority,
    riskScore: item.risk_score === null || item.risk_score === undefined ? null as any : Number(item.risk_score),
    status: BACKEND_TO_UI_STATUS[item.status] || 'Assigned',
    crewName: team?.name || 'Pending Assignment',
    teamId: team?._id || undefined,
    assignedVehicle: team?.vehiclePlate || 'Not assigned',
    scheduledTime: item.scheduled_time || 'Not scheduled',
    estimatedCompletion: plan.estimated_completion_minutes ? `${plan.estimated_completion_minutes} min` : 'Not estimated',
    materialsNeeded: Array.isArray(plan.materials) && plan.materials.length ? plan.materials.join(', ') : 'Not planned',
    estimatedCostInr: item.estimated_cost_inr ?? 0,
    beforePhotoUrl: assetUrl(item.photo_url) || '',
    afterPhotoUrl: assetUrl(item.repair_photo_url),
    aiVerificationScore: item.repair_verified ? 100 : undefined,
    aiVerificationNotes: item.repair_verification_notes || undefined,
    completionProofNote: item.repair_verification_notes || undefined,
    repairInstructions: Array.isArray(plan.safety_requirements) ? plan.safety_requirements : [],
    depthMeasurementCm: recommendation.estimated_depth_cm ?? undefined,
    materialsUsed: {
      coldMixBags: Number(used.cold_mix_bags ?? 0),
      asphaltKg: Number(used.asphalt_kg ?? 0),
      concreteKg: Number(used.concrete_kg ?? 0),
      compactorMinutes: Number(used.compactor_minutes ?? 0),
      otherMaterials: Array.isArray(used.other_materials) ? used.other_materials : [],
    },
    aiRecommendation: {
      material: recommendation.material || '',
      materialKg: recommendation.material_kg ?? null,
      safetyZoneM: recommendation.safety_zone_m ?? null,
      notes: recommendation.notes || '',
      available: item.ai_analysis_status === 'AVAILABLE',
    },
  } as MaintenanceWorkOrder;
};

export const getWorkOrders = async (): Promise<MaintenanceWorkOrder[]> => {
  const res = await apiClient.get('/complaints');
  return Promise.all((res.data?.data || []).map(mapComplaintToWorkOrder));
};

export const getWorkOrderById = async (id: string): Promise<MaintenanceWorkOrder> => {
  const res = await apiClient.get(`/complaints/${id}`);
  return mapComplaintToWorkOrder(res.data.data);
};

export const getCurrentTeamWorkOrder = async (teamId: string): Promise<{ team: FieldTeam; workOrder: MaintenanceWorkOrder | null }> => {
  const res = await apiClient.get(`/field-teams/${teamId}/current-work-order`);
  const data = res.data?.data;
  return {
    team: mapBackendTeam(data.team),
    workOrder: data.workOrder ? await mapComplaintToWorkOrder(data.workOrder) : null,
  };
};

export const assignTeamToWorkOrder = async (workOrderId: string, teamId: string, estimatedCostInr?: number) => {
  const res = await apiClient.patch(`/complaints/${workOrderId}/assign`, { teamId, estimatedCostInr });
  return res.data.data;
};

export const updateWorkOrderStatus = async (workOrderId: string, status: MaintenanceWorkOrder['status']) => {
  const res = await apiClient.patch(`/complaints/${workOrderId}/status`, { status: UI_TO_BACKEND_STATUS[status] });
  return res.data.data;
};

export const updateMaterialsUsed = async (workOrderId: string, materials: Partial<MaterialsUsed>) => {
  const payload: any = {};
  if (materials.coldMixBags !== undefined) payload.cold_mix_bags = materials.coldMixBags;
  if (materials.asphaltKg !== undefined) payload.asphalt_kg = materials.asphaltKg;
  if (materials.concreteKg !== undefined) payload.concrete_kg = materials.concreteKg;
  if (materials.compactorMinutes !== undefined) payload.compactor_minutes = materials.compactorMinutes;
  if (materials.otherMaterials !== undefined) payload.other_materials = materials.otherMaterials;
  const res = await apiClient.patch(`/complaints/${workOrderId}/materials`, payload);
  return res.data.data;
};

export const getTeamMessages = async (teamId: string): Promise<TeamMessage[]> => {
  const res = await apiClient.get(`/field-teams/${teamId}/messages`);
  return (res.data?.data || []).map((m: any) => ({ id: m._id, teamId: m.team_id, sender: m.sender, message: m.message, createdAt: m.createdAt }));
};

export const sendTeamMessage = async (teamId: string, sender: string, message: string): Promise<TeamMessage> => {
  const res = await apiClient.post(`/field-teams/${teamId}/messages`, { sender, message });
  const m = res.data.data;
  return { id: m._id, teamId: m.team_id, sender: m.sender, message: m.message, createdAt: m.createdAt };
};

export const submitRepairVerification = async (workOrderId: string, afterPhoto: File) => {
  const formData = new FormData();
  formData.append('afterPhoto', afterPhoto);
  const res = await apiClient.post(`/complaints/${workOrderId}/verify`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.data.verification as { repaired: boolean; residual_confidence: number | null; message: string };
};
