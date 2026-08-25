import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Smartphone,
  Cpu,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  FileCheck2,
  Navigation,
  Truck,
  Wrench,
  Camera,
  CheckCircle2,
  Layers,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const IntelligenceLoopVisualizer: React.FC = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState<number>(0);

  const phases = [
    {
      num: '01',
      title: 'Citizen Hazard Submission',
      icon: Smartphone,
      entity: 'Citizen App / IoT Sensor',
      input: 'Citizen photo of 18cm pothole on Andheri East Link + GPS coordinates',
      processing: 'Auto-geotagging & duplicate report clustering',
      output: 'Validated Citizen Report #REP-2026-88',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      num: '02',
      title: 'Computer Vision Defect Triage',
      icon: Cpu,
      entity: 'Prahari Neural Vision Engine',
      input: 'RGB Frame + Drone LiDAR Depth Scan',
      processing: 'YOLOv10 Pothole Segmentation + Subgrade Volume Calculation',
      output: 'Pothole Depth: 18cm · Void Area: 1.4m² · Severity: Critical',
      color: 'from-cyan-500 to-teal-400',
    },
    {
      num: '03',
      title: 'Multi-Modal Risk Matrix',
      icon: TrendingUp,
      entity: 'Prahari Risk Inference Model',
      input: 'Defect Severity + 48,000 VPD Traffic + 120mm Monsoon Downpour',
      processing: 'Multi-factor risk weight aggregation & failure velocity model',
      output: 'Composite Risk Score: 94/100 · Confidence: 96.2%',
      color: 'from-amber-500 to-orange-400',
    },
    {
      num: '04',
      title: 'Automated P1 Priority Queue',
      icon: AlertOctagon,
      entity: 'National Priority Ranker',
      input: 'All city-wide active defects',
      processing: 'Triage optimization ranking by public safety impact',
      output: 'Rank #1 in Municipal Ward · SLA: 6-Hour Repair Window',
      color: 'from-red-600 to-amber-500',
    },
    {
      num: '05',
      title: 'Authority Decision & Authorization',
      icon: ShieldCheck,
      entity: 'PWD / NHAI Executive Command',
      input: 'AI Recommended Action: Cold Mix Asphalt Injection',
      processing: 'One-click executive sign-off and contractor escrow lock',
      output: 'Authorized Work Order #WO-2026-041 (Budget ₹18,500)',
      color: 'from-blue-600 to-indigo-500',
    },
    {
      num: '06',
      title: 'Field Fleet Smart Dispatch',
      icon: FileCheck2,
      entity: 'Maintenance Command Center',
      input: 'Nearby Fleet GPS Telemetry (Squad Alpha 450m away)',
      processing: 'Matching crew material loadout to defect requirement',
      output: 'Squad Alpha Dispatched with 4x Cold Mix Polymer Bags',
      color: 'from-purple-600 to-blue-500',
    },
    {
      num: '07',
      title: 'Emergency Green Wave Routing',
      icon: Navigation,
      entity: 'Traffic Controller AI Preemption',
      input: 'Squad Vehicle GPS Track',
      processing: 'Dynamic signal timing synchronization on Corridor B',
      output: '9 Traffic Signals Preempted to Green Wave (6 min saved)',
      color: 'from-emerald-500 to-cyan-400',
    },
    {
      num: '08',
      title: 'Field Worker Tablet Inspection',
      icon: Truck,
      entity: 'Squad Alpha Tablet Companion',
      input: 'On-site arrive trigger via Geofence (0.8m accuracy)',
      processing: 'Mandatory structural & safety barrier checklist completion',
      output: 'Safety Barrier 20m Upstream Deployed & Verified',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      num: '09',
      title: 'On-Site Repair Execution',
      icon: Wrench,
      entity: 'Field Maintenance Crew',
      input: 'Polymer Cold Mix Application + Plate Compaction',
      processing: 'Material volume usage logged in real time',
      output: '100kg Cold Mix Placed & Compacted (25 min compaction time)',
      color: 'from-amber-500 to-yellow-400',
    },
    {
      num: '10',
      title: 'Optical AI Repair Verification',
      icon: Camera,
      entity: 'Prahari Verification Engine',
      input: 'Post-repair photo from field tablet',
      processing: 'Texture continuity & surface smoothness score comparison',
      output: 'Verification Score: 98.4% Match Pass (Flush surface)',
      color: 'from-emerald-600 to-teal-400',
    },
    {
      num: '11',
      title: 'Digital Audit Stamp & Escrow Release',
      icon: CheckCircle2,
      entity: 'Smart Contract / Government Ledger',
      input: 'GPS proof + AI Optical Verification Token',
      processing: 'Automatic municipal compliance audit certification',
      output: 'Audit Token #NHAI-AUD-041 Generated · Contractor Paid',
      color: 'from-teal-500 to-emerald-400',
    },
    {
      num: '12',
      title: 'Predictive Health & Loop Close',
      icon: Layers,
      entity: 'Predictive Infrastructure Database',
      input: 'Repaired Corridor Health Telemetry',
      processing: 'Road health score updated from 42% → 94%',
      output: 'Risk Closed · Asset degradation timer reset for 24 months',
      color: 'from-blue-600 to-cyan-500',
    },
  ];

  const current = phases[activePhase];

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e3fd] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              SMART INDIA HACKATHON (SIH) ECOSYSTEM ARCHITECTURE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            RoadGuard Closed-Loop Intelligence Ecosystem
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Interactive demonstration of the complete closed-loop lifecycle from citizen detection to AI optical verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/authority')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-[#001738] font-black text-xs shadow-lg transition-all"
          >
            <span>Return to Executive Command</span>
          </button>
        </div>
      </div>

      {/* 12-Step Horizontal Interactive Ecosystem Stepper */}
      <div className="bg-[#0e1626] p-4 rounded-2xl border border-slate-800 shadow-2xl overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-2 min-w-[1000px] py-1">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            const isSelected = activePhase === idx;
            return (
              <div
                key={phase.num}
                onClick={() => setActivePhase(idx)}
                className={`flex-1 p-2.5 rounded-xl border transition-all cursor-pointer text-center space-y-1.5 ${
                  isSelected
                    ? 'bg-blue-600/20 border-[#00e3fd] shadow-[0_0_15px_rgba(0,227,253,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-[#00e3fd]' : 'text-slate-400'
                    }`}
                  />
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-300">{phase.num}</div>
                <div className="text-[10px] font-bold text-white line-clamp-1">{phase.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Deep-Dive Focus Card */}
      <div className="bg-[#0e1626] p-6 md:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-[#001738] font-black text-xl shadow-lg">
              {current.num}
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                STAGE {current.num} OF 12 · {current.entity}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white mt-0.5">{current.title}</h2>
            </div>
          </div>

          {/* Navigation Prev/Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
              disabled={activePhase === 0}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              {activePhase + 1} / {phases.length}
            </span>
            <button
              onClick={() => setActivePhase(Math.min(phases.length - 1, activePhase + 1))}
              disabled={activePhase === phases.length - 1}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Phase Telemetry Data Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              1. INPUT DATA STREAM
            </div>
            <div className="text-xs text-white font-medium">{current.input}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              2. NEURAL / ENGINE PROCESSING
            </div>
            <div className="text-xs text-white font-medium">{current.processing}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
            <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              3. VERIFIED OPERATIONAL OUTPUT
            </div>
            <div className="text-xs text-emerald-300 font-bold">{current.output}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
