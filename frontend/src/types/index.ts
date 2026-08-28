export type UserRole = 'citizen' | 'authority' | 'maintenance' | 'emergency';

export type DefectType = 
  | 'pothole'
  | 'crack'
  | 'subsidence'
  | 'joint_degradation'
  | 'waterlogging'
  | 'streetlight'
  | 'debris'
  | 'fissure'
  | 'bridge_damage'
  | 'landslide';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type ReportStatus = 
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  city: string;
  landmark?: string;
  roadName?: string;
}

export interface AIDefectAnalysis {
  defectType: DefectType;
  defectName: string;
  confidence: number;
  severity: SeverityLevel;
  estimatedDepth?: string;
  estimatedDimensions?: string;
  riskScore: number;
  departmentRouting: string;
  priorityLevel: 'P1' | 'P2' | 'P3' | 'P4';
  potentialDuplicate?: {
    reportId: string;
    distanceMeters: number;
    matchConfidence: number;
  };
  reasoning?: {
    edgeDetection: string;
    depthEstimation: string;
    trafficCorrelation: string;
    pedestrianRisk: string;
  };
}

export interface DefectReport {
  id: string;
  title: string;
  defectType: DefectType;
  severity: SeverityLevel;
  status: ReportStatus;
  location: LocationCoordinates;
  imageUrl: string;
  thumbnailUrl?: string;
  aiAnalysis: AIDefectAnalysis;
  reportedAt: string;
  updatedAt: string;
  reportedBy: {
    name: string;
    isAnonymous: boolean;
    phone?: string;
  };
  assignedTeam?: {
    teamId: string;
    name: string;
    department: string;
    lead: string;
    eta?: string;
  };
  timeline: {
    status: ReportStatus;
    title: string;
    timestamp: string;
    description: string;
    actor?: string;
  }[];
  commentsCount: number;
  upvotes: number;
}

export interface RoadSegment {
  id: string;
  name: string;
  district: string;
  city: string;
  lengthKm: number;
  healthScore: number; // 0 - 100 (lower means critical)
  riskLevel: SeverityLevel;
  accidentHistoryCount: number;
  lightingStatus: 'Good' | 'Adequate' | 'Poor' | 'Outage';
  trafficVolume: 'High' | 'Elevated' | 'Moderate' | 'Low';
  vehiclesPerDay: number;
  activeAnomaliesCount: number;
  lastScanned: string;
  coordinates: { lat: number; lng: number };
  potholeCount?: number;
  subsidenceRisk?: 'High' | 'Medium' | 'Low' | 'None';
  floodRisk?: 'Severe' | 'Moderate' | 'Low' | 'None';
  bridgeHealth?: number;
}

export interface PriorityQueueItem {
  rank: number;
  id: string;
  roadName: string;
  district: string;
  city: string;
  affectedLengthKm: number;
  severityLevel: SeverityLevel;
  triageScore: number; // 0 - 100
  aiConfidence: number;
  anomaliesDetected: number;
  anomalyDelta: string;
  accidentCountLast30Days: number;
  trafficVolumeText: string;
  vehiclesPerDay: number;
  imageUrl: string;
  reasoning: {
    severityIndex: { score: number; text: string };
    locationRisk: { score: number; text: string };
    accidentCorrelation: { score: number; text: string };
    trafficImpact: { score: number; text: string };
  };
  recommendedAction: string;
  allocatedDepartment: string;
  estimatedRepairCost: string;
  requiredCrew: string;
  p1Deadline?: string;
  publicImpactScore?: number;
  trafficImpactScore?: number;
  safetyImpactScore?: number;
}

export interface SystemAlert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'RESOLVED';
  title: string;
  message: string;
  location: string;
  timestamp: string;
  isRead: boolean;
  acknowledged: boolean;
  relatedId?: string;
  actionUrl?: string;
  aiConfidence?: number;
  affectedAsset?: string;
  recommendedAction?: string;
}

export interface EmergencyRouteOption {
  id: 'A' | 'B' | 'C';
  name: string;
  isRecommended: boolean;
  riskLevel: SeverityLevel;
  distanceKm: number;
  estimatedEtaMin: number;
  trafficStatus: string;
  bottlenecks: string[];
  advantages: string[];
  aiAssessment: string;
  signalPreemptionNodes: number;
  roadConditionText?: string;
  riskReductionMin?: number;
}

export interface SimulationStep {
  stepIndex: number;
  phaseNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed';
  icon: string;
  badgeColor: string;
  nodeData?: any;
}

// Emergency Response Incident
export interface EmergencyIncident {
  id: string;
  title: string;
  defectType: DefectType;
  location: string;
  coordinates: { lat: number; lng: number };
  detectedTime: string;
  severity: SeverityLevel;
  riskScore: number;
  status: 'Awaiting Dispatch' | 'Dispatched' | 'On Scene' | 'Secured' | 'Resolved';
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  affectedLanes: number;
  estimatedTrafficDelayMin: number;
  source: 'AI Computer Vision' | 'Citizen Sos' | 'Highway Patrol IoT' | 'Sensors';
  aiConfidence: number;
  recommendedActions: string[];
  assignedUnits: {
    unitId: string;
    type: 'EMS Ambulance' | 'Police Patrol' | 'Heavy Rescue' | 'PWD Quick Paver';
    callsign: string;
    etaMin: number;
    distanceKm: number;
    status: string;
  }[];
  hospitalLiaison?: {
    name: string;
    distanceKm: number;
    traumaBayReady: boolean;
    greenWaveSignals: number;
  };
}

// Field Maintenance Team
export interface FieldTeam {
  id: string;
  name: string;
  callsign: string;
  status: 'AVAILABLE' | 'EN ROUTE' | 'ON SITE' | 'MAINTENANCE' | 'OFFLINE';
  membersCount: number;
  leadName: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  currentTask: string;
  currentWorkOrderId?: string;
  etaMin: number;
  equipment: string[];
  batteryPct: number;
  vehiclePlate: string;
  vehicleType: string;
  shiftHours: string;
  todayCompletedCount: number;
}

// Work Order Lifecycle
export interface MaintenanceWorkOrder {
  id: string;
  reportId: string;
  roadName: string;
  location: string;
  defectType: DefectType;
  department: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  riskScore: number;
  status: 'Assigned' | 'En Route' | 'On Site' | 'Repairing' | 'Inspection' | 'Completed';
  crewName: string;
  teamId?: string;
  assignedVehicle: string;
  scheduledTime: string;
  estimatedCompletion: string;
  materialsNeeded: string;
  estimatedCostInr: number;
  actualCostInr?: number;
  beforePhotoUrl: string;
  afterPhotoUrl?: string;
  completionProofNote?: string;
  gpsVerified?: boolean;
  aiVerificationScore?: number;
  aiVerificationNotes?: string;
  repairInstructions?: string[];
  depthMeasurementCm?: number;
}

// Predictive Infrastructure Asset
export interface PredictiveAsset {
  id: string;
  name: string;
  assetType: 'Bridge' | 'Highway Segment' | 'Expressway Flyover' | 'Underpass Tunnel';
  location: string;
  currentHealthPct: number;
  health30d: number;
  health60d: number;
  health90d: number;
  failureProbabilityPct: number;
  recommendedInterventionDays: number;
  estimatedPreventiveCostInr: number;
  estimatedCatastrophicCostInr: number;
  expectedDowntimeDays: number;
  publicImpactScore: number; // 0 - 100
  aiPredictionSummary: string;
  stressFactors: {
    name: string;
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
  }[];
  inspectionsCount: number;
  lastUltrasoundScan: string;
}

// Authentication & Session Types
export interface AuthUser {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  clearanceLevel: 'LEVEL-1 PUBLIC' | 'LEVEL-2 FIELD' | 'LEVEL-3 DISPATCH' | 'LEVEL-4 EXECUTIVE HQ';
  badgeNumber: string;
  avatarUrl?: string;
  lastLoginAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
  isAuthenticated: boolean;
}

export interface RoleCredentialPreset {
  role: UserRole;
  title: string;
  subtitle: string;
  iconName: string;
  badge: string;
  defaultEmail: string;
  defaultEmployeeId: string;
  targetRoute: string;
  clearanceLabel: string;
  description: string;
}
