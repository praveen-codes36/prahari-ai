export interface CopilotQueryResponse {
  query: string;
  response: string;
  keyInsights: string[];
  recommendedAction?: string;
  relatedAssetId?: string;
  confidenceScore: number;
  timestamp: string;
}

export const executeCopilotQuery = async (query: string): Promise<CopilotQueryResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('civil lines') || lowerQuery.includes('why is civil lines') || lowerQuery.includes('#1')) {
    return {
      query,
      response: `Civil Lines Road is ranked #1 in the AI Repair Priority Queue with a Triage Score of 91/100 due to a confluence of critical risk factors:
• 17 active anomalies detected with rapid growth (+4 since last scan)
• Direct proximity to St. Xavier Primary School zone creates acute pedestrian and school-van hazard
• Historical telemetry correlates this segment with 8 severe collisions in the last 30 days during low-light hours
• Subgrade moisture readings indicate high probability of complete sub-base collapse under forecasted rain within 48 hours.`,
      keyInsights: [
        'Severity Index: 94% (Critical structural rupture)',
        'Location Risk: 82% (School corridor & hospital transit route)',
        'Accident Correlation: 88% (Direct collision locus)',
        'Monsoon Vulnerability: 85% (High washout probability)',
      ],
      recommendedAction: 'Immediate deployment of Quick Response Unit 01 for 24h cold-mix patching and subgrade stabilization.',
      relatedAssetId: 'PRIO-001',
      confidenceScore: 98.4,
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  if (lowerQuery.includes('immediate repair') || lowerQuery.includes('critical') || lowerQuery.includes('which roads')) {
    return {
      query,
      response: `Based on real-time neural triage across 14,208 active road network segments, 3 corridors demand immediate operational intervention within 24 hours:
1. Civil Lines Road (Score: 91/100) — Structural fissures near school zone
2. Sector 4 Highway Subsidence, NH-48 (Score: 97/100) — High-speed depression risking vehicle rollover
3. Andheri East Link Road (Score: 89/100) — Deep pothole cluster in heavy transit zone`,
      keyInsights: [
        'Total Pending Critical Incidents: 342',
        'Top 3 incidents account for 64% of high-severity accident risk',
        'Available PWD asphalt capacity: 85% ready for overnight deployment',
      ],
      recommendedAction: 'Approve bulk dispatch for Triage Priority Queue #1 to #3.',
      relatedAssetId: 'PRIO-001',
      confidenceScore: 97.2,
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  if (lowerQuery.includes('school') || lowerQuery.includes('schools') || lowerQuery.includes('pedestrian')) {
    return {
      query,
      response: `Spatial filtering identified 4 high-severity defects situated within 200 meters of educational institutions:
• Civil Lines Road (St. Xavier Primary) — Score 91
• JVLR North Bypass (Kendriya Vidyalaya) — Score 78
• Bellandur Main Road (Orchid International) — Score 76
• MG Road Sector 12 (Delhi Public School lane) — Score 74

Traffic calming protocols and preemptive warning beacons have been automatically signaled to smart roadside message boards.`,
      keyInsights: [
        '4 active school zone hazards logged',
        'Peak student transit hours: 07:30 - 09:00 & 14:00 - 16:00',
        'Smart signage activated with 20 km/h advisory speed limit',
      ],
      recommendedAction: 'Mobilize daytime flagmen and priority cold-patch crew before tomorrow morning commute.',
      confidenceScore: 96.5,
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  if (lowerQuery.includes('resources') || lowerQuery.includes('materials') || lowerQuery.includes('crews')) {
    return {
      query,
      response: `Current Municipal & Highway Resource Status:
• Active Crews Deployed: 14 / 18 units
• Standby Quick Response Teams: 4 units (Ready for immediate dispatch)
• Asphalt Reserves: 140 Metric Tons cold-mix polymer + 85 MT SMA
• Heavy Milling Machines: 3 operational, 1 undergoing maintenance
• Available resources are sufficient to resolve all Top 5 priority queue items in the next 12 hours.`,
      keyInsights: [
        'Resource Utilization Rate: 77.8%',
        'Average Dispatch Time: 18 minutes',
        'Sufficient reserves for 48h emergency surge',
      ],
      recommendedAction: 'Authorize allocation of 12 Tons cold-mix to Sector 4 and Civil Lines Road.',
      confidenceScore: 99.1,
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // Default intelligent briefing
  return {
    query,
    response: `Prahari AI Copilot Infrastructure Risk Briefing:
Across monitored zones, overall road network health index stands at 74.2%. 
A weather front entering from the western corridor is predicted to elevate pothole formation by +24% on NH-8 and Western Expressways over the next 48 hours. 
Preemptive drainage clearance and mobile sensor patrols are actively prioritized.`,
    keyInsights: [
      'Monsoon weather warning active for Western corridor',
      'Predicted defect acceleration rate: +24%',
      'Active network monitoring nodes: 142 live sensors',
    ],
    recommendedAction: 'Maintain elevated alert status across Western & Northern suburban sectors.',
    confidenceScore: 95.0,
    timestamp: new Date().toLocaleTimeString(),
  };
};
