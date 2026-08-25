import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Hospital,
  Zap,
  Activity,
  Cpu,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';

export const SimulationCenter: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const simulationPhases = [
    {
      phase: 'PHASE 01',
      title: 'Incident Telemetry & G-Shock Trigger',
      desc: 'Smart road vibration sensor & dashcam feed detect acute 2.4G vertical deceleration on Andheri Link.',
      time: '0.00s',
      node: 'SENSOR_NODE_44',
      badgeColor: 'text-[#ff5252] bg-[#93000a]/30 border-[#ffb4ab]/30',
    },
    {
      phase: 'PHASE 02',
      title: 'Neural Vision Segmentation & Depth Extraction',
      desc: 'Edge CV-Vision extracts asphalt sub-base fracture geometry. Depth calculated at 16.8cm.',
      time: '+0.42s',
      node: 'EDGE_INFERENCE_V4',
      badgeColor: 'text-[#00daf3] bg-[#00e3fd]/15 border-[#00e3fd]/30',
    },
    {
      phase: 'PHASE 03',
      title: 'Algorithmic Risk Triaging & Priority Score',
      desc: 'Assigned Triage Score: 94/100 (P1 Critical). Duplicate spatial match verified against registry.',
      time: '+0.88s',
      node: 'PRAHARI_TRIAGE_CORE',
      badgeColor: 'text-[#ffa000] bg-[#ffa000]/15 border-[#ffa000]/30',
    },
    {
      phase: 'PHASE 04',
      title: 'EMS Fleet Lock & Nearest Unit Latching',
      desc: 'Ambulance EMS-42 locked at 2.1km proximity. Driver HUD updated with hazard avoidance vector.',
      time: '+1.35s',
      node: 'FLEET_GPS_DISPATCH',
      badgeColor: 'text-[#00daf3] bg-[#00e3fd]/15 border-[#00e3fd]/30',
    },
    {
      phase: 'PHASE 05',
      title: 'Trauma Center Preparation Broadcast',
      desc: 'Apollo Trauma HQ received patient telemetry & estimated transit ETA. Bay 02 armed.',
      time: '+1.75s',
      node: 'HEALTHCARE_GATEWAY',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
    {
      phase: 'PHASE 06',
      title: 'Traffic Signal Green Wave Preemption',
      desc: '9 sequential intersection traffic controllers switched to 90s priority green corridor.',
      time: '+2.10s',
      node: 'SIGNAL_CONTROLLER_GRID',
      badgeColor: 'text-[#00daf3] bg-[#00e3fd]/15 border-[#00e3fd]/30',
    },
    {
      phase: 'PHASE 07',
      title: 'Corridor Optimization & ETA Confirmation',
      desc: 'Total transit time reduced from 18 min to 12 min (33.3% latency reduction). Protocol verified.',
      time: '+2.45s',
      node: 'COMMAND_SUCCESS',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
  ];

  const handleStartSimulation = async () => {
    setIsRunning(true);
    setHasCompleted(false);
    setActiveStep(0);

    for (let i = 0; i < simulationPhases.length; i++) {
      setActiveStep(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 550));
    }

    setIsRunning(false);
    setHasCompleted(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setActiveStep(0);
    setHasCompleted(false);
  };

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* Header with Title & Trigger Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/30">
              PRAHARI PROTOCOL SIMULATION SUITE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Incident Response Simulation Center
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            Test end-to-end telemetry triggers, neural triage latencies, and green-corridor signal overrides in a live sandbox.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={isRunning || activeStep === 0}
            className="p-2.5 rounded-xl bg-[#191f2f] hover:bg-[#242a3a] text-[#8c90a1] hover:text-white border border-white/10 transition-colors disabled:opacity-40"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStartSimulation}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs shadow-[0_0_20px_rgba(179,197,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            <span>{isRunning ? 'Executing Simulation...' : 'Trigger Simulated Event'}</span>
          </button>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <Cpu className="w-4 h-4 text-[#00daf3]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block">Neural Latency</span>
            <strong className="text-xs text-white font-mono">14.2 ms / inference</strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <Zap className="w-4 h-4 text-[#ffa000]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block">Signal Lock API</span>
            <strong className="text-xs text-white font-mono">99.4% Synchronized</strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <Hospital className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block">Hospital Link</span>
            <strong className="text-xs text-white font-mono">Apollo Bay 02 Armed</strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <Activity className="w-4 h-4 text-[#ff5252]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block">Time Saved</span>
            <strong className="text-xs text-[#00daf3] font-mono">6 min (33.3%)</strong>
          </div>
        </div>
      </div>

      {/* 7-Step Interactive Progression Timeline */}
      <div className="bg-[#151b2b] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00daf3] animate-pulse" />
            Execution Pipeline Telemetry Stream
          </h3>
          <span className="text-xs font-mono text-[#00daf3]">
            Step {activeStep} of {simulationPhases.length}
          </span>
        </div>

        <div className="space-y-3">
          {simulationPhases.map((phase, idx) => {
            const stepNum = idx + 1;
            const isCompleted = activeStep >= stepNum;
            const isCurrent = activeStep === stepNum && isRunning;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#191f2f] border-[#00daf3] shadow-[0_0_15px_rgba(0,227,253,0.3)] scale-[1.01]'
                    : isCompleted
                    ? 'bg-[#151b2b] border-white/10 opacity-100'
                    : 'bg-[#0d1322]/50 border-white/5 opacity-40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#8c90a1]">
                      {phase.phase}
                    </span>
                    <h4 className="text-sm font-bold text-white">{phase.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${phase.badgeColor}`}>
                      {phase.node}
                    </span>
                    <span className="text-xs font-mono text-[#8c90a1]">{phase.time}</span>
                  </div>
                </div>

                <p className="text-xs text-[#c2c6d8] leading-relaxed">{phase.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
