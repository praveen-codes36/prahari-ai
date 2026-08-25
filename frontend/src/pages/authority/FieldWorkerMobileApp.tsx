import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Navigation,
  MapPin,
  CheckCircle2,
  Camera,
  Bot,
  Sparkles,
  AlertTriangle,
  Clock,
  Wrench,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  UploadCloud,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
} from 'lucide-react';

export const FieldWorkerMobileApp: React.FC = () => {
  const navigate = useNavigate();

  // Field execution workflow state
  const [activeStep, setActiveStep] = useState<number>(2); // 0: Navigation, 1: Arrived, 2: Inspection, 3: Evidence, 4: Repairing, 5: Verification, 6: Complete
  const [checklist, setChecklist] = useState({
    roadSurface: true,
    potholeDepth: true,
    structuralDamage: false,
    drainage: true,
    safetyBarriers: true,
  });

  const [coldMixBags, setColdMixBags] = useState<number>(4);
  const [compactorTimeMin, setCompactorTimeMin] = useState<number>(25);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVerifyProof = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      setActiveStep(6);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              FIELD CREW HIGH-CONTRAST SQUAD COMPANION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Field Worker Mobile Tablet App
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Field-ready interface for on-site inspection, material logging, and instantaneous AI repair verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/authority/field-teams')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold border border-slate-700 transition-all"
          >
            <span>Back to Fleet Command</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Frame Layout Simulation */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left 7 Cols: Active Task & Guided Inspection Workflow */}
        <div className="md:col-span-7 bg-[#0b101c] p-6 rounded-3xl border-2 border-slate-700 shadow-2xl space-y-6">
          {/* Mobile Device Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 text-[#00e3fd] font-bold">
              <Smartphone className="w-4 h-4" />
              <span>SQUAD TABLET · SQUAD ALPHA (MH-04-FT-021)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>GPS ACCURATE (0.8m)</span>
              <span>● 94%</span>
            </div>
          </div>

          {/* Today's Priority Assignment */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-red-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase bg-red-950 px-2 py-0.5 rounded border border-red-500/50">
                P1 CRITICAL TASK
              </span>
              <span className="text-xs font-mono text-slate-400">Order #WO-2026-041</span>
            </div>
            <h3 className="text-lg font-black text-white">Andheri East Link Road (KM 3.4)</h3>
            <div className="text-xs text-slate-300">
              Severe crater pothole & subgrade softening near Chakala Metro Pier 14.
            </div>
            <div className="flex items-center gap-3 text-xs font-mono pt-1 text-cyan-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                450m away
              </span>
              <span>· Target Finish: 18:30 IST</span>
            </div>
          </div>

          {/* Step Sequence Tabs */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              FIELD ACTION WORKFLOW STEP:
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono font-bold">
              {[
                { step: 1, label: 'En Route' },
                { step: 2, label: 'On Site Check' },
                { step: 4, label: 'Repairing' },
                { step: 6, label: 'Verified' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`py-2 rounded-xl transition-all ${
                    activeStep >= s.step
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-[#001738] shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step Specific Workspaces */}
          {activeStep === 2 && (
            <div className="space-y-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  Mandatory Field Safety & Structural Checklist
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'roadSurface', label: 'Road surface perimeter cleared of loose debris' },
                  { key: 'potholeDepth', label: 'Crater depth measured (>14cm requiring tack coat)' },
                  { key: 'structuralDamage', label: 'No radial cracks extending to adjacent lane' },
                  { key: 'drainage', label: 'Storm drain inlet inspected & cleared of blockage' },
                  { key: 'safetyBarriers', label: 'Retroreflective safety cones placed 20m upstream' },
                ].map((item) => {
                  const isChecked = checklist[item.key as keyof typeof checklist];
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleChecklist(item.key as keyof typeof checklist)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-blue-600/20 border-cyan-500/40 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveStep(4)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-[#001738] font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <span>Checklist Complete → Start Repair Execution</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Material Usage & Compaction Log
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                  <div className="text-[10px] font-mono text-slate-400">COLD MIX BAGS (25kg)</div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setColdMixBags(Math.max(1, coldMixBags - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-base"
                    >
                      -
                    </button>
                    <span className="text-2xl font-mono font-bold text-white">{coldMixBags}</span>
                    <button
                      onClick={() => setColdMixBags(coldMixBags + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-base"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">Total: {coldMixBags * 25} kg</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                  <div className="text-[10px] font-mono text-slate-400">PLATE COMPACTION (min)</div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setCompactorTimeMin(Math.max(5, compactorTimeMin - 5))}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-base"
                    >
                      -
                    </button>
                    <span className="text-2xl font-mono font-bold text-white">{compactorTimeMin}</span>
                    <button
                      onClick={() => setCompactorTimeMin(compactorTimeMin + 5)}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-base"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">Compaction: Optimal</div>
                </div>
              </div>

              <button
                onClick={handleVerifyProof}
                disabled={isVerifying}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-500 text-[#001738] font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{isVerifying ? 'Running AI Vision Analysis...' : 'Capture Photo & AI Optical Verify'}</span>
              </button>
            </div>
          )}

          {activeStep === 6 && (
            <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-white">REPAIR VERIFIED & WORK ORDER COMPLETE</h3>
              <p className="text-xs text-emerald-200 max-w-sm mx-auto">
                AI Computer Vision verified surface smoothness (98.4%). Digital audit token generated and sent to PWD Executive Engineer.
              </p>
              <button
                onClick={() => navigate('/authority/work-orders')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Return to Work Orders
              </button>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Dedicated AI Field Copilot (Section 18) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#0e1626] p-5 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-[#00e3fd] flex items-center justify-center">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI FIELD COPILOT
                </h3>
                <div className="text-[10px] font-mono text-cyan-400">Active Ultrasonic Assistance</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-300 font-medium">
                "Detected pothole depth approximately <strong className="text-white">14 cm</strong>. Recommended repair: <strong className="text-cyan-400">Cold mix asphalt 42 kg</strong>, safety barrier zone <strong className="text-white">12 meters</strong>."
              </div>
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Potential hidden issue: Culvert drainage obstruction 3m east. Inspect catchpit before sealing.</span>
              </div>
            </div>

            {/* Quick Field Voice Prompts */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                QUICK COPILOT COMMANDS:
              </div>
              {[
                'Request extra cold-mix batch from Depot 4',
                'Report traffic barrier damage',
                'Request police escort for lane widening',
              ].map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => alert(`Copilot command sent: "${cmd}"`)}
                  className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between group"
                >
                  <span className="truncate">{cmd}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
