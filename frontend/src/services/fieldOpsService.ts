import apiClient from './apiClient';
import { FieldTeam, MaintenanceWorkOrder } from '../types';
import { reverseGeocode } from '../utils/location';

const assetUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return value.startsWith('/') ? value : `/${value.replace(/\\/g, '/')}`;
};

const mapBackendTeam = (t: any): FieldTeam => ({
  id: t._id,
  name: t.name,
  callsign: t.callsign,
  status: t.status,
  membersCount: t.membersCount ?? 0,
  leadName: t.leadName ?? 'Unassigned',
  locationName: t.locationName ?? 'Unknown location',
  coordinates: t.coordinates || { lat: 25.4358, lng: 81.8463 },
  currentTask: t.currentTask ?? 'Standing by',
  currentWorkOrderId: t.currentWorkOrderId?._id || t.currentWorkOrderId || undefined,
  etaMin: t.etaMin ?? 0,
  equipment: t.equipment || [],
  batteryPct: t.batteryPct ?? 0,
  vehiclePlate: t.vehiclePlate ?? 'N/A',
  vehicleType: t.vehicleType ?? 'N/A',
  shiftHours: t.shiftHours || '06:00 - 18:00 IST',
  todayCompletedCount: t.todayCompletedCount || 0,
});

export const getFieldTeams = async (): Promise<FieldTeam[]> => {
  const res = await apiClient.get('/field-teams');
  return (res.data?.data || []).map(mapBackendTeam);
};

export const updateFieldTeamStatus = async (
  teamId: string,
  updates: Partial<Pick<FieldTeam, 'status' | 'locationName' | 'currentTask' | 'etaMin' | 'batteryPct'>>
): Promise<FieldTeam> => {
  const res = await apiClient.patch(`/field-teams/${teamId}/status`, updates);
  return mapBackendTeam(res.data.data);
};

const BACKEND_TO_UI_STATUS: Record<string, MaintenanceWorkOrder['status']> = {
  REPORTED: 'Assigned',
  AI_VERIFIED: 'Assigned',
  ASSIGNED: 'Assigned',
  EN_ROUTE: 'En Route',
  ON_SITE: 'On Site',
  WORK_IN_PROGRESS: 'Repairing',
  INSPECTION: 'Inspection',
  RESOLVED: 'Completed',
};

const UI_TO_BACKEND_STATUS: Record<MaintenanceWorkOrder['status'], string> = {
  Assigned: 'ASSIGNED',
  'En Route': 'EN_ROUTE',
  'On Site': 'ON_SITE',
  Repairing: 'WORK_IN_PROGRESS',
  Inspection: 'INSPECTION',
  Completed: 'RESOLVED',
};

const priorityFromComplaint = (item: any): MaintenanceWorkOrder['priority'] => {
  const bySeverity: Record<string, MaintenanceWorkOrder['priority']> = {
    CRITICAL: 'P1', HIGH: 'P2', MEDIUM: 'P3', LOW: 'P4',
  };
  return bySeverity[item.severity] || 'P3';
};

const mapComplaintToWorkOrder = async (item: any): Promise<MaintenanceWorkOrder> => {
  const risk = Number(item.risk_score ?? item.confidence_score ?? 50);
  const priority = priorityFromComplaint(item);
  let address = item.location?.address || 'Unknown Location';
  const coords = item.location?.coordinates;
  if (coords?.length === 2 && (!address || address === 'Unknown Location')) {
    try {
      const geo = await reverseGeocode(coords[1], coords[0]);
      address = geo.address || geo.city || address;
    } catch {
      // Keep a stable fallback; geocoding must never hide the work order.
    }
  }
  const team = item.assigned_team_id;
  const estimatedCost = item.estimated_cost_inr ?? (priority === 'P1' ? 50000 : priority === 'P2' ? 30000 : priority === 'P3' ? 15000 : 8000);

  return {
    id: item._id,
    reportId: item._id,
    roadName: String(item.road_name || item.defect_type || 'Infrastructure defect').replace(/_/g, ' '),
    location: address,
    defectType: String(item.defect_type || 'OTHER').toLowerCase() as MaintenanceWorkOrder['defectType'],
    department: item.assigned_department_id?.name || 'Unassigned',
    priority,
    riskScore: risk,
    status: BACKEND_TO_UI_STATUS[item.status] || 'Assigned',
    crewName: team?.name || 'Pending Assignment',
    teamId: team?._id || undefined,
    assignedVehicle: team?.vehiclePlate || 'N/A',
    scheduledTime: item.scheduled_time || 'ASAP',
    estimatedCompletion: item.estimated_completion || '4 hrs',
    materialsNeeded: item.materials_needed || 'Standard Repair Kit',
    estimatedCostInr: estimatedCost,
    beforePhotoUrl: assetUrl(item.photo_url) || '',
    afterPhotoUrl: assetUrl(item.repair_photo_url),
    aiVerificationScore: item.repair_verified ? 100 : undefined,
    aiVerificationNotes: item.repair_verification_notes || undefined,
    completionProofNote: item.repair_verification_notes || undefined,
  };
};

export const getWorkOrders = async (): Promise<MaintenanceWorkOrder[]> => {
  const res = await apiClient.get('/complaints');
  return Promise.all((res.data?.data || []).map(mapComplaintToWorkOrder));
};

export const getWorkOrderById = async (id: string): Promise<MaintenanceWorkOrder> => {
  const res = await apiClient.get(`/complaints/${id}`);
  return mapComplaintToWorkOrder(res.data.data);
};

export const assignTeamToWorkOrder = async (workOrderId: string, teamId: string, estimatedCostInr?: number) => {
  const res = await apiClient.patch(`/complaints/${workOrderId}/assign`, { teamId, estimatedCostInr });
  return res.data.data;
};

export const updateWorkOrderStatus = async (workOrderId: string, status: MaintenanceWorkOrder['status']) => {
  const res = await apiClient.patch(`/complaints/${workOrderId}/status`, { status: UI_TO_BACKEND_STATUS[status] });
  return res.data.data;
};

export const submitRepairVerification = async (workOrderId: string, afterPhoto: File) => {
  const formData = new FormData();
  formData.append('afterPhoto', afterPhoto);
  const res = await apiClient.post(`/complaints/${workOrderId}/verify`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.data.verification as { repaired: boolean; residual_confidence: number | null; message: string };
};
