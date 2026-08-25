import { EmergencyRouteOption } from '../types';
import { MOCK_EMERGENCY_ROUTES } from '../data/mockData';

export const calculateEmergencyRoutes = async (
  origin: string = 'Current GPS (Unit EMS-42)',
  destination: string = 'District Trauma Center (AIIMS/Apollo)'
): Promise<{
  routes: EmergencyRouteOption[];
  timestamp: string;
  recommendedRouteId: 'A' | 'B' | 'C';
  totalCorridorSignals: number;
}> => {
  // Simulate routing engine optimization latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    routes: MOCK_EMERGENCY_ROUTES,
    timestamp: new Date().toLocaleTimeString(),
    recommendedRouteId: 'B',
    totalCorridorSignals: 9,
  };
};

export const dispatchEmergencyRoute = async (routeId: 'A' | 'B' | 'C') => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    success: true,
    routeId,
    dispatchId: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
    signalLockGranted: true,
    signalsPreempted: routeId === 'B' ? 9 : 4,
    estimatedArrivalTime: routeId === 'B' ? '12 mins' : '18 mins',
    status: 'ACTIVE_GREEN_WAVE',
  };
};
