import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Shield,
  Layers,
  Activity,
  Maximize2,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { AIConfidenceRing } from '../../components/common/AIConfidenceRing';
import { SeverityBadge } from '../../components/common/Badges';
import { analyzeDefectImage, ScanStage } from '../../services/aiDefectService';
import { AIDefectAnalysis, DefectType, SeverityLevel } from '../../types';

export const ReportDefectFlow: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRoad = searchParams.get('road') || 'Andheri East Link Road, Mumbai';

  const [step, setStep] = useState<'upload' | 'scanning' | 'analysis' | 'location' | 'success'>('upload');
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80'
  );
  const [scanProgress, setScanProgress] = useState<ScanStage>({
    stage: 'START',
    progress: 0,
    message: 'Initializing neural model...',
  });
  const [aiAnalysis, setAiAnalysis] = useState<AIDefectAnalysis | null>(null);
  const [address, setAddress] = useState(preselectedRoad);
  const [landmark, setLandmark] = useState('Opposite Metro Pillar 142');
  const [userNotes, setUserNotes] = useState('');
  const [generatedReportId, setGeneratedReportId] = useState('PR-8823-A');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Sample presets for quick testing
  const samplePresets = [
    {
      name: 'Severe Pothole',
      type: 'pothole',
      img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Highway Subsidence',
      type: 'subsidence',
      img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Bridge Joint Gap',
      type: 'joint_degradation',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Streetlight Outage',
      type: 'streetlight',
      img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const handleStartScan = async (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setStep('scanning');

    try {
      const result = await analyzeDefectImage(imageSrc, (stage) => {
        setScanProgress(stage);
      });
      setAiAnalysis(result);
      setStep('analysis');
    } catch (err) {
      console.error('AI Scan error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleStartScan(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = () => {
    const newId = `PR-${Math.floor(1000 + Math.random() * 9000)}-${aiAnalysis?.defectType?.charAt(0).toUpperCase() || 'R'}`;
    setGeneratedReportId(newId);
    setStep('success');
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 pt-2">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button
          onClick={() => {
            if (step === 'upload') navigate('/citizen');
            else if (step === 'analysis') setStep('upload');
            else if (step === 'location') setStep('analysis');
            else if (step === 'success') navigate('/citizen/my-reports');
          }}
          className="flex items-center gap-1.5 text-xs font-mono text-[#8c90a1] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#00daf3]">
            {step === 'upload' && 'STEP 1: CAPTURE PHOTO'}
            {step === 'scanning' && 'STEP 2: NEURAL VISION SCAN'}
            {step === 'analysis' && 'STEP 3: AI TRIAGE REVIEW'}
            {step === 'location' && 'STEP 4: LOCATION & SUBMIT'}
            {step === 'success' && 'CONFIRMATION'}
          </span>
        </div>
      </div>

      {/* STEP 1: Upload / Capture */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white">Report Road Hazard</h1>
            <p className="text-xs md:text-sm text-[#8c90a1]">
              Capture a clear photo of the pothole, subsidence, or road damage for instant AI triage.
            </p>
          </div>

          {/* Main Upload Box */}
          <div className="relative border-2 border-dashed border-white/20 hover:border-[#00daf3]/60 rounded-2xl p-8 bg-[#151b2b]/90 text-center transition-all group">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#b3c5ff]/10 text-[#b3c5ff] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00e3fd]/20 group-hover:text-[#00daf3] transition-all shadow-[0_0_20px_rgba(179,197,255,0.2)]">
                <Camera className="w-8 h-8 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Take a Photo or Upload</h3>
                <p className="text-xs text-[#8c90a1] mt-1">
                  Supports JPEG, PNG, HEIC · AI automatically latches GPS EXIF
                </p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-[#b3c5ff] text-[#002b75] font-bold text-xs shadow-lg">
                Browse or Open Camera
              </button>
            </div>
          </div>

          {/* Quick Preset Samples for Testing */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#8c90a1]">
              <span>Or test with verified incident sample presets:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStartScan(preset.img)}
                  className="flex flex-col items-center p-2 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] border border-white/10 hover:border-[#00daf3]/50 transition-all text-left group"
                >
                  <img
                    src={preset.img}
                    alt={preset.name}
                    className="w-full h-20 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[11px] font-semibold text-white group-hover:text-[#00daf3] truncate w-full text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Live Scanning Animation */}
      {step === 'scanning' && (
        <div className="space-y-6 text-center">
          <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-[#080e1d] border border-[#00e3fd]/40 shadow-[0_0_30px_rgba(0,227,253,0.2)]">
            <img
              src={selectedImage}
              alt="Scanning road hazard"
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />

            {/* Scanning Grid and Reticle */}
            <div className="absolute inset-0 grid-pattern opacity-40" />
            <div className="absolute inset-x-0 h-1 bg-[#00e3fd] shadow-[0_0_15px_#00e3fd] animate-pulse top-1/2 -translate-y-1/2" />

            {/* Neural Bounding Box Target */}
            <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-2 border-[#00e3fd] rounded-lg shadow-[0_0_20px_rgba(0,227,253,0.5)] flex flex-col justify-between p-2">
              <div className="flex justify-between text-[10px] font-mono text-[#00e3fd]">
                <span>[DETECT_ZONE_01]</span>
                <span>CONF: {scanProgress.progress}%</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#00e3fd]">
                <span>DEPTH_KRNL</span>
                <span>ASPHALT_RUPTURE</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#00daf3] font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-spin" />
                {scanProgress.stage}
              </span>
              <span className="text-white font-bold">{scanProgress.progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#191f2f] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0066ff] via-[#00e3fd] to-[#bdf4ff] transition-all duration-300 shadow-[0_0_10px_#00e3fd]"
                style={{ width: `${scanProgress.progress}%` }}
              />
            </div>

            <p className="text-sm font-semibold text-white">{scanProgress.message}</p>
            {scanProgress.detail && (
              <p className="text-xs font-mono text-[#8c90a1] bg-[#0d1322]/80 p-2 rounded-lg border border-white/5">
                {scanProgress.detail}
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: AI Defect Analysis Results Screen (Matching Stitch Screen) */}
      {step === 'analysis' && aiAnalysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Card with Image & Confidence Ring */}
          <div className="bg-[#151b2b] rounded-2xl p-5 md:p-6 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image Preview with Bounding Box Overlay */}
              <div className="relative w-full md:w-5/12 h-64 rounded-xl overflow-hidden bg-[#080e1d] border border-white/10 shrink-0">
                <img
                  src={selectedImage}
                  alt="Detected Defect"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* Bounding box */}
                <div className="absolute top-[30%] left-[25%] right-[20%] bottom-[25%] border-2 border-[#ff5252] rounded shadow-[0_0_15px_rgba(255,82,82,0.8)] pointer-events-none flex items-start p-1">
                  <span className="bg-[#93000a] text-[#ffdad6] text-[9px] font-mono px-1 py-0.5 rounded">
                    POTHOLE &gt;15CM
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <SeverityBadge severity={aiAnalysis.severity} />
                </div>
              </div>

              {/* Triage Overview Column */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/30">
                      AI Triage Summary
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                      {aiAnalysis.defectName}
                    </h2>
                  </div>
                  <AIConfidenceRing score={aiAnalysis.confidence} size={54} />
                </div>

                {/* Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-[#191f2f] p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-[#8c90a1] block">Estimated Depth</span>
                    <span className="text-sm font-bold text-[#ffb4ab] font-mono">{aiAnalysis.estimatedDepth}</span>
                  </div>
                  <div className="bg-[#191f2f] p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-[#8c90a1] block">Dimensions</span>
                    <span className="text-sm font-bold text-white font-mono">{aiAnalysis.estimatedDimensions}</span>
                  </div>
                  <div className="bg-[#191f2f] p-2.5 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-mono text-[#8c90a1] block">Assigned Routing</span>
                    <span className="text-xs font-bold text-[#00daf3] truncate block">{aiAnalysis.departmentRouting}</span>
                  </div>
                </div>

                {/* Duplicate Warning Callout if present */}
                {aiAnalysis.potentialDuplicate && (
                  <div className="bg-[#ffa000]/15 border border-[#ffa000]/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#ffd180]">
                    <AlertTriangle className="w-4 h-4 text-[#ffa000] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Nearby Matching Report Detected:</span> A similar report (
                      <strong className="text-white font-mono">#{aiAnalysis.potentialDuplicate.reportId}</strong>) was logged{' '}
                      {aiAnalysis.potentialDuplicate.distanceMeters}m away ({aiAnalysis.potentialDuplicate.matchConfidence}% match). Your submission will be linked to boost repair priority.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Algorithmic Reasoning Breakdown Accordion / Section */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-mono uppercase text-[#8c90a1] tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#00daf3]" />
                Neural Vision Reasoning Telemetry
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0d1322]/70 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono text-[#00daf3] block font-bold mb-1">
                    EDGE & TEXTURE EXTRACTION
                  </span>
                  <p className="text-[#c2c6d8] leading-relaxed">{aiAnalysis.reasoning.edgeDetection}</p>
                </div>

                <div className="bg-[#0d1322]/70 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono text-[#00daf3] block font-bold mb-1">
                    DEPTH GRADIENT ANALYSIS
                  </span>
                  <p className="text-[#c2c6d8] leading-relaxed">{aiAnalysis.reasoning.depthEstimation}</p>
                </div>

                <div className="bg-[#0d1322]/70 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono text-[#00daf3] block font-bold mb-1">
                    TRAFFIC CORRELATION
                  </span>
                  <p className="text-[#c2c6d8] leading-relaxed">{aiAnalysis.reasoning.trafficCorrelation}</p>
                </div>

                <div className="bg-[#0d1322]/70 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono text-[#00daf3] block font-bold mb-1">
                    PEDESTRIAN & COMMUTER RISK
                  </span>
                  <p className="text-[#c2c6d8] leading-relaxed">{aiAnalysis.reasoning.pedestrianRisk}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2.5 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] text-xs font-mono text-[#8c90a1] hover:text-white transition-colors"
            >
              Re-Scan Photo
            </button>
            <button
              onClick={() => setStep('location')}
              className="px-6 py-2.5 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs shadow-[0_0_15px_rgba(179,197,255,0.4)] flex items-center gap-2 transition-all"
            >
              <span>Confirm & Proceed to Location</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Location & Metadata Confirmation */}
      {step === 'location' && (
        <div className="space-y-6">
          <div className="bg-[#151b2b] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00daf3]" />
              Confirm Hazard Location
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8c90a1] mb-1">
                  GPS Verified Address / Road Segment
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#191f2f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00daf3]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8c90a1] mb-1">
                  Nearest Landmark / Direction Notes
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near metro pillar, opposite petrol pump..."
                  className="w-full bg-[#191f2f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00daf3]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8c90a1] mb-1">
                  Additional Citizen Observations (Optional)
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Multiple bikes swerving suddenly; severe during rain..."
                  className="w-full bg-[#191f2f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00daf3] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded bg-[#191f2f] border-white/20 text-[#00daf3] focus:ring-0"
                />
                <label htmlFor="anonymousCheck" className="text-xs text-[#c2c6d8] cursor-pointer">
                  Submit report anonymously (Hide my phone & name from public feed)
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep('analysis')}
              className="px-4 py-2.5 rounded-xl bg-[#191f2f] text-xs font-mono text-[#8c90a1] hover:text-white"
            >
              Back to AI Triage
            </button>
            <button
              onClick={handleFinalSubmit}
              className="px-7 py-3 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-sm shadow-[0_0_20px_rgba(179,197,255,0.4)] active:scale-95 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              Submit Defect Report
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Success Screen */}
      {step === 'success' && (
        <div className="bg-[#151b2b] rounded-2xl p-8 border border-white/10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2.5 py-0.5 rounded border border-[#00e3fd]/30">
              Dispatched to Authority Queue
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Report Successfully Logged</h1>
            <p className="text-xs md:text-sm text-[#8c90a1] max-w-md mx-auto">
              Your defect report has been verified by the Prahari Neural Engine and assigned to the Municipal PWD Quick Response Desk.
            </p>
          </div>

          <div className="bg-[#191f2f] p-4 rounded-xl max-w-md mx-auto border border-white/10 text-left space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#8c90a1]">Tracking ID:</span>
              <span className="text-white font-bold bg-[#0d1322] px-2 py-1 rounded border border-white/5">
                {generatedReportId}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#8c90a1]">Assigned Dept:</span>
              <span className="text-[#00daf3] font-bold">BMC Suburban PWD</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#8c90a1]">Priority Triage:</span>
              <span className="text-[#ffb4ab] font-bold">P1 CRITICAL</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/citizen/my-reports')}
              className="px-6 py-3 rounded-xl bg-[#b3c5ff] text-[#002b75] font-bold text-xs shadow-lg hover:bg-[#dae1ff] transition-all"
            >
              Track in My Reports
            </button>
            <button
              onClick={() => navigate('/citizen')}
              className="px-6 py-3 rounded-xl bg-[#191f2f] text-white font-semibold text-xs border border-white/10 hover:bg-[#242a3a] transition-all"
            >
              Return to Citizen Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
