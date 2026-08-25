import { AIDefectAnalysis, DefectType, SeverityLevel } from '../types';

export interface ScanStage {
  stage: string;
  progress: number;
  message: string;
  detail?: string;
}

export const analyzeDefectImage = async (
  _imageFileOrUrl: string,
  onProgress?: (stage: ScanStage) => void
): Promise<AIDefectAnalysis> => {
  const steps: ScanStage[] = [
    { stage: 'INGEST', progress: 15, message: 'CV-Vision online: Ingesting image buffer & telemetry...', detail: 'Latching EXIF location coordinates: 19.1136° N, 72.8697° E' },
    { stage: 'PREPROCESS', progress: 35, message: 'Normalizing photometric exposure and texture contrast...', detail: 'High-contrast edge kernel applied across road asphalt plane' },
    { stage: 'SEGMENTATION', progress: 60, message: 'Neural semantic segmentation in progress...', detail: 'Detected asphalt sub-base fracture bounding box (140px × 100px)' },
    { stage: 'DEPTH_ESTIMATION', progress: 80, message: 'Shadow stereoscopic gradient depth estimation...', detail: 'Estimated crater depth: 16.8 cm (Exceeds >15cm safety threshold)' },
    { stage: 'DUPLICATE_CHECK', progress: 92, message: 'Cross-referencing spatial incident registry for duplicates...', detail: 'Identified potential open report #RD-8842 located 40m away' },
    { stage: 'CLASSIFICATION', progress: 100, message: 'Triage complete. Routing to Municipal PWD.', detail: 'Confidence: 94% · Severity: CRITICAL · Priority: P1' },
  ];

  for (const step of steps) {
    if (onProgress) {
      onProgress(step);
    }
    // Simulate real AI processing latency for UI fidelity
    await new Promise((resolve) => setTimeout(resolve, 380));
  }

  return {
    defectType: 'pothole',
    defectName: 'Structural Pothole >15cm depth',
    confidence: 94,
    severity: 'critical',
    estimatedDepth: '>16.8 cm',
    estimatedDimensions: '1.4m × 0.9m',
    riskScore: 92,
    departmentRouting: 'PWD-ROAD (Western Circle)',
    priorityLevel: 'P1',
    potentialDuplicate: {
      reportId: 'RD-8842',
      distanceMeters: 40,
      matchConfidence: 88,
    },
    reasoning: {
      edgeDetection: 'High-contrast boundary identified indicating structural rupture of top asphalt layer.',
      depthEstimation: 'Shadow gradient analysis confirms depth exceeds 15cm threshold, presenting immediate axle fracture hazard.',
      trafficCorrelation: 'High-density urban commuter artery with heavy bus transit volume.',
      pedestrianRisk: 'Severe skid hazard for two-wheelers and pedestrians in wet monsoon conditions.',
    },
  };
};

export const getSeverityColor = (severity: SeverityLevel) => {
  switch (severity) {
    case 'critical':
      return {
        text: 'text-[#ffb4ab]',
        bg: 'bg-[#93000a]/30',
        border: 'border-[#ffb4ab]/40',
        glow: 'shadow-[0_0_12px_rgba(255,180,171,0.5)]',
        badgeBg: 'bg-[#93000a]',
        badgeText: 'text-[#ffdad6]',
      };
    case 'high':
      return {
        text: 'text-[#ffa000]',
        bg: 'bg-[#ffa000]/15',
        border: 'border-[#ffa000]/30',
        glow: 'shadow-[0_0_12px_rgba(255,160,0,0.4)]',
        badgeBg: 'bg-[#ffa000]/25',
        badgeText: 'text-[#ffa000]',
      };
    case 'medium':
      return {
        text: 'text-[#bdf4ff]',
        bg: 'bg-[#00e3fd]/15',
        border: 'border-[#00e3fd]/30',
        glow: 'shadow-[0_0_10px_rgba(0,227,253,0.3)]',
        badgeBg: 'bg-[#00e3fd]/20',
        badgeText: 'text-[#bdf4ff]',
      };
    case 'low':
    default:
      return {
        text: 'text-[#b3c5ff]',
        bg: 'bg-[#0066ff]/15',
        border: 'border-[#b3c5ff]/20',
        glow: 'shadow-[0_0_8px_rgba(179,197,255,0.2)]',
        badgeBg: 'bg-[#0066ff]/20',
        badgeText: 'text-[#b3c5ff]',
      };
  }
};
