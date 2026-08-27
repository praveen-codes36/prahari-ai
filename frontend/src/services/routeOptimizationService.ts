import { EmergencyRouteOption } from '../types';
import apiClient from './apiClient';

export const calculateEmergencyRoutes = async (
  origin: string = 'Current GPS (Unit EMS-42)',
  destination: string = 'District Trauma Center (AIIMS/Apollo)'
): Promise<{
  routes: EmergencyRouteOption[];
  timestamp: string;
  recommendedRouteId: 'A' | 'B' | 'C';
  totalCorridorSignals: number;
}> => {
  try {
    // Call Node.js backend which proxies to Python ML routing engine
    const res = await apiClient.post('/emergency/route', {
      // Mock coordinates for demo unless origin/dest can be parsed to coords
      latitude: 25.4358,
      longitude: 81.8463
    });
    
    const data = res.data.data; // Standard ApiResponse structure
    const routeData = data.route; // Python ML route object

    // Transform backend response to frontend EmergencyRouteOption
    const routes: EmergencyRouteOption[] = [
      {
        id: 'A',
        name: 'Fastest Route (Direct)',
        isRecommended: routeData?.recommended_route_type === 'fastest',
        riskLevel: 'high',
        distanceKm: 7.2, // mock or parse from backend if available
        estimatedEtaMin: routeData?.fastest_route_eta_mins || 15,
        trafficStatus: 'High Congestion',
        bottlenecks: ['Sector 4 Junction', 'Market Road'],
        advantages: ['Shortest Physical Distance'],
        aiAssessment: 'Provides lowest baseline ETA but exposes ambulance to higher anomaly density.',
        signalPreemptionNodes: 4,
        roadConditionText: 'Poor surface quality with multiple deep potholes',
      },
      {
        id: 'B',
        name: 'Safest Route (Bypass)',
        isRecommended: routeData?.recommended_route_type === 'safest',
        riskLevel: (routeData?.safest_route_avg_risk || 0) > 60 ? 'high' : (routeData?.safest_route_avg_risk || 0) > 30 ? 'medium' : 'low',
        distanceKm: 9.1,
        estimatedEtaMin: routeData?.safest_route_eta_mins || 18,
        trafficStatus: 'Clear',
        bottlenecks: [],
        advantages: ['Clean Road Surface', 'Low Risk Score'],
        aiAssessment: 'Minimizes patient trauma by avoiding P1 severity zones despite longer distance.',
        signalPreemptionNodes: 9,
        roadConditionText: `${routeData?.safest_route_pothole_count || 0} anomalies detected`,
        riskReductionMin: 4,
      }
    ];

    return {
      routes,
      timestamp: new Date().toLocaleTimeString(),
      recommendedRouteId: routeData?.recommended_route_type === 'safest' ? 'B' : 'A',
      totalCorridorSignals: 9,
    };
  } catch (error) {
    console.error('Route optimization failed:', error);
    // Return empty fallback on error
    return {
      routes: [],
      timestamp: new Date().toLocaleTimeString(),
      recommendedRouteId: 'A',
      totalCorridorSignals: 0,
    };
  }
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
