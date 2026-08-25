import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Layers,
  Sparkles,
  CloudRain,
  Truck,
  Activity,
  History,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Zap,
  ArrowRight,
  Eye,
  Sliders,
  FileCheck2,
  Clock,
} from 'lucide-react';
import { MOCK_ROAD_SEGMENTS, MOCK_PRIORITY_QUEUE } from '../../data/mockData';

export const AIRiskIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('RD-DEL-02'); // NH-48 KM 14.2

  const assetDetails = {
    'RD-DEL-02': {
      name: 'NH-48 KM 14.2 Expressway Corridor',
      district: 'South West / IGI Airport Approach',
      city: 'Delhi',
      currentRisk: 78,
      pred24h: 84,
      pred72h: 91,
      confidence: 93.7,
      anomalyDelta: '+34%',
      cvFindings: 'Radial shear contour lines indicating subgrade void expansion >24cm deep.',
      trafficLoad: '135,000 Vehicles/day (38% Class-8 Commercial Freight)',
      weatherCorrelation: '78mm monsoon downpour forecast within 48 hours (High saturation risk)',
      citizenReportsCount: 17,
      accidentHistoryCount: 4,
      priorRepairStatus: 'Failed cold patch application 4 months ago (Sub-base wash out)',
      recommendedAction: 'IMMEDIATE FIELD INSPECTION & DEEP GROUT INJECTION',
      urgencyDeadline: 'Execute within 6 Hours',
      breakdownFactors: [
        { label: 'Pavement Structural Shear', weight: '+32 pts', score: 94, desc: 'Deep synthetic laser contour shows void under 30cm sub-base' },
        { label: 'Heavy Axle Repetitions', weight: '+24 pts', score: 88, desc: '38,000 multi-axle freight vehicles/day accelerating deformation' },
        { label: 'Hydraulic Water Ingress', weight: '+18 pts', score: 82, desc: 'Subgrade moisture migration from nearby drainage leakage' },
        { label: 'Citizen Incident Triage', weight: '+12 pts', score: 76, desc: '17 independent reports verified with optical similarity match' },
        { label: 'Prior Patch Failure', weight: '+8 pts', score: 70, desc: 'Recurrent defect at coordinates (28.5355, 77.0866)' },
      ],
    },
    'RD-MUM-01': {
      name: 'Andheri East Link Road',
      district: 'Western Suburbs',
      city: 'Mumbai',
      currentRisk: 82,
      pred24h: 88,
      pred72h: 94,
      confidence: 96.2,
      anomalyDelta: '+21%',
      cvFindings: 'Severe pothole clusters >18cm depth penetrating wearing and binder courses.',
      trafficLoad: '48,000 Vehicles/day (Dense bus and two-wheeler flow)',
      weatherCorrelation: 'Continuous 120mm coastal rainfall causing sub-base liquefaction',
      citizenReportsCount: 29,
      accidentHistoryCount: 6,
      priorRepairStatus: 'Surface overlay eroded by heavy monsoon runoff',
      recommendedAction: 'COLD MIX POLYMER ASPHALT PATCHING & DRAIN CLEANOUT',
      urgencyDeadline: 'Execute within 4 Hours',
      breakdownFactors: [
        { label: 'Pothole Depth Penetration', weight: '+36 pts', score: 96, desc: 'Crater depth exceeds 18cm, creating immediate axle fracture risk' },
        { label: 'Monsoon Saturation Index', weight: '+28 pts', score: 92, desc: 'Standing water saturates aggregate subgrade for 18h continuous' },
        { label: 'Two-Wheeler Crash Risk', weight: '+16 pts', score: 85, desc: 'High skid probability near Chakala Metro crossing' },
        { label: 'Public Sentiment Surge', weight: '+14 pts', score: 80, desc: '29 citizen complaints in 24 hours via RoadGuard Citizen App' },
      ],
    },
    'RD-BLR-01': {
      name: 'Outer Ring Road (Marathahalli - Bellandur)',
      district: 'East Zone Tech Corridor',
      city: 'Bengaluru',
      currentRisk: 74,
      pred24h: 79,
      pred72h: 87,
      confidence: 92.4,
      anomalyDelta: '+18%',
      cvFindings: 'Longitudinal structural cracking networks along bus-lane corridor.',
      trafficLoad: '92,000 Vehicles/day (Dense tech corridor transit)',
      weatherCorrelation: 'Flash waterlogging propensity at low-lying culvert nodes',
      citizenReportsCount: 14,
      accidentHistoryCount: 3,
      priorRepairStatus: 'Routine micro-surfacing 8 months ago',
      recommendedAction: 'MICRO-SURFACING OVERLAY & STORM DRAIN EXPANSION',
      urgencyDeadline: 'Execute within 12 Hours',
      breakdownFactors: [
        { label: 'Drainage Backpressure', weight: '+30 pts', score: 90, desc: 'Culvert capacity deficit causing 2-lane standing water' },
        { label: 'Bus Axle Shear Load', weight: '+26 pts', score: 84, desc: 'High frequency electric bus deceleration grooves' },
        { label: 'Aggregate Polishing', weight: '+18 pts', score: 78, desc: 'Friction coefficient dropped below 0.35 skid safety threshold' },
      ],
    },
  };

  const current = assetDetails[selectedAssetId as keyof typeof assetDetails] || assetDetails['RD-DEL-02'];

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e3fd] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              PRAHARI NEURAL PREDICTION ENGINE v4.8
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            AI Risk Intelligence & Explainability Core
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Multi-modal explainable AI correlating Computer Vision telemetry, heavy freight loads, monsoon forecasts, and citizen reports.
          </p>
        </div>

        {/* Asset Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">Target Asset:</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="bg-[#080d17] text-white border border-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#00e3fd]"
          >
            <option value="RD-DEL-02">NH-48 KM 14.2 (Delhi)</option>
            <option value="RD-MUM-01">Andheri East Link (Mumbai)</option>
            <option value="RD-BLR-01">Outer Ring Road (Bengaluru)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Asset Risk Trajectory & Explainability WHY panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Risk Score & Predictive Trajectory */}
        <div className="lg:col-span-5 bg-[#0e1626] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-[10px] font-mono text-cyan-400">{selectedAssetId}</div>
              <h2 className="text-xl font-bold text-white mt-0.5">{current.name}</h2>
              <div className="text-xs text-slate-400">{current.district}, {current.city}</div>
            </div>

            {/* Current vs Predicted Trajectory Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">CURRENT RISK</div>
                <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                  {current.currentRisk} <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="text-[9px] font-mono text-amber-300 mt-0.5">High Risk</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-red-500/30">
                <div className="text-[10px] font-mono text-slate-400">PREDICTED 24h</div>
                <div className="text-2xl font-mono font-black text-red-400 mt-1">
                  {current.pred24h} <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="text-[9px] font-mono text-red-300 mt-0.5">Critical Risk</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <div className="text-[10px] font-mono text-slate-400">PREDICTED 72h</div>
                <div className="text-2xl font-mono font-black text-red-500 mt-1">
                  {current.pred72h} <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="text-[9px] font-mono text-red-400 mt-0.5">Collapse Hazard</div>
              </div>
            </div>

            {/* AI Confidence Meter */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#00e3fd] flex items-center justify-center font-mono font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">AI PREDICTIVE CONFIDENCE</div>
                  <div className="text-[10px] font-mono text-slate-400">Trained on 4.2M Km Indian Road Telemetry</div>
                </div>
              </div>
              <div className="text-xl font-mono font-black text-[#00e3fd]">
                {current.confidence}%
              </div>
            </div>

            {/* Recommended Action Card */}
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
              <div className="text-[10px] font-mono font-bold text-red-400 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Recommended Authority Action
              </div>
              <div className="text-xs font-bold text-white tracking-wide">
                {current.recommendedAction}
              </div>
              <div className="text-[11px] font-mono text-red-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Deadline: {current.urgencyDeadline}
              </div>
            </div>
          </div>

          {/* Direct Action Trigger Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate('/authority/maintenance-command')}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-[#001738] font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Create P1 Work Order for Squad</span>
            </button>
            <button
              onClick={() => navigate('/authority/emergency-ops')}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>Simulate Emergency Lane Diversion</span>
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Multi-Factor AI Reasoning "WHY?" Breakdown */}
        <div className="lg:col-span-7 bg-[#0e1626] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00e3fd]" />
                AI Explainability Breakdown (WHY this is risky)
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical contribution matrix determining the composite risk index
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              SHAP / Attention Matrix
            </span>
          </div>

          {/* Factor Weight Bars */}
          <div className="space-y-3.5">
            {current.breakdownFactors.map((factor, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-center font-bold">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">{factor.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{factor.weight}</span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      factor.score > 90
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                        : factor.score > 80
                        ? 'bg-amber-400'
                        : 'bg-[#00e3fd]'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-300">{factor.desc}</div>
              </div>
            ))}
          </div>

          {/* Multi-Modal Evidence Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
              <Eye className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">COMPUTER VISION FINDINGS</div>
                <div className="text-xs text-white font-medium mt-0.5">{current.cvFindings}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">TRAFFIC CORRELATION</div>
                <div className="text-xs text-white font-medium mt-0.5">{current.trafficLoad}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
              <CloudRain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">WEATHER SATURATION</div>
                <div className="text-xs text-white font-medium mt-0.5">{current.weatherCorrelation}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
              <History className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">HISTORICAL RECURRENCE</div>
                <div className="text-xs text-white font-medium mt-0.5">{current.priorRepairStatus}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
