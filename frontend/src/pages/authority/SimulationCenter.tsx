import React, { useState, useEffect } from 'react';
import {
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
  MapPin,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Check,
  Bell,
  RefreshCw,
} from 'lucide-react';
import apiClient from '../../services/apiClient';

interface CorridorOption {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

const PRAYAGRAJ_CORRIDORS: CorridorOption[] = [
  {
    name: 'MG Marg / Civil Lines Corridor',
    lat: 25.4526,
    lng: 81.8349,
    description: 'High-density commercial arterial with central hospital connectivity',
  },
  {
    name: 'Phaphamau NH-19 Junction',
    lat: 25.4981,
    lng: 81.8542,
    description: 'Northern highway transit bottleneck with multi-lane convergence',
  },
  {
    name: 'Naini Industrial Heavy Corridor',
    lat: 25.3985,
    lng: 81.8681,
    description: 'Southern heavy freight route with severe surface stress points',
  },
  {
    name: 'Shastri Bridge / Jhunsi Arterial',
    lat: 25.4389,
    lng: 81.8845,
    description: 'Eastern river crossing critical emergency bypass artery',
  },
];

interface SimulationTelemetry {
  alert_id?: string;
  corridor_name: string;
  lat: number;
  lng: number;
  severity: string;
  nearest_ambulance?: {
    id?: string;
    vehicle_number: string;
    distance_km: number;
    status: string;
  };
  recommended_hospital?: {
    id?: string;
    name: string;
    distance_km: number;
    trauma_bay: string;
  };
  risk_triage?: {
    priority_score: number;
    severity: string;
    defects_in_vicinity: number;
    surface_fracture_depth_cm: number;
  };
  green_wave_control?: {
    synchronized_signals: number;
    signal_lock_rate: string;
    green_corridor_window_sec: number;
  };
  corridor_optimization?: {
    baseline_eta_mins: number;
    optimized_eta_mins: number;
    time_saved_mins: number;
    time_saved_percent: string;
    latency_reduction: string;
    smart_latency_ms: number;
    recommended_route: string;
  };
}

export const SimulationCenter: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selection inputs
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorOption>(PRAYAGRAJ_CORRIDORS[0]);
  const [selectedSeverity, setSelectedSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');

  // Live telemetry data populated from backend
  const [telemetry, setTelemetry] = useState<SimulationTelemetry | null>(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);

  // Load initial active alerts count from backend
  const fetchActiveAlerts = async () => {
    try {
      const res = await apiClient.get('/alerts/active');
      if (res.data?.data) {
        setActiveAlertsCount(Array.isArray(res.data.data) ? res.data.data.length : 0);
      }
    } catch {
      // Non-critical background fetch
    }
  };

  useEffect(() => {
    fetchActiveAlerts();
  }, []);

  // Build dynamic 7-phase execution stream based on real live telemetry
  const getDynamicPhases = () => {
    const t = telemetry;
    const corridorName = t?.corridor_name || selectedCorridor.name;
    const ambVehicle = t?.nearest_ambulance?.vehicle_number || 'EMS-42';
    const ambDist = t?.nearest_ambulance?.distance_km ?? 1.8;
    const hospName = t?.recommended_hospital?.name || 'Swaroop Rani Nehru (SRN) Hospital';
    const hospDist = t?.recommended_hospital?.distance_km ?? 2.4;
    const bayName = t?.recommended_hospital?.trauma_bay || 'Bay 02 Armed';
    const priorityScore = t?.risk_triage?.priority_score ?? 94;
    const fractureDepth = t?.risk_triage?.surface_fracture_depth_cm ?? 16.8;
    const signalsCount = t?.green_wave_control?.synchronized_signals ?? 9;
    const baseEta = t?.corridor_optimization?.baseline_eta_mins ?? 16;
    const optEta = t?.corridor_optimization?.optimized_eta_mins ?? 10;
    const savedMins = t?.corridor_optimization?.time_saved_mins ?? (baseEta - optEta);
    const savedPercent = t?.corridor_optimization?.time_saved_percent ?? '33.3%';
    const alertId = t?.alert_id ? `#${t.alert_id.slice(-6).toUpperCase()}` : 'NEW_INCIDENT';

    return [
      {
        phase: 'PHASE 01',
        title: 'Incident Ingestion & G-Shock Trigger',
        desc: `Simulated ${selectedSeverity} event triggered on ${corridorName} (${(t?.lat || selectedCorridor.lat).toFixed(4)}°N, ${(t?.lng || selectedCorridor.lng).toFixed(4)}°E). Broadcasted as Alert ${alertId}.`,
        time: '0.00s',
        node: 'IOT_SENSOR_GRID',
        badgeColor: 'text-[#ff5252] bg-[#93000a]/30 border-[#ffb4ab]/30',
      },
      {
        phase: 'PHASE 02',
        title: 'Computer Vision & Depth Extraction',
        desc: `Vision segmentation extracts pavement fracture geometry on corridor. Defect severity verified with estimated depth of ${fractureDepth}cm.`,
        time: '+0.38s',
        node: 'EDGE_INFERENCE_CV',
        badgeColor: 'text-[#00daf3] bg-[#00e3fd]/15 border-[#00e3fd]/30',
      },
      {
        phase: 'PHASE 03',
        title: 'Closed-Loop Triaging & Priority Score',
        desc: `Assigned Priority Check Score: ${priorityScore}/100 (${selectedSeverity} Priority). Cross-module recalculation hook synchronized risk matrices and repair queues.`,
        time: '+0.75s',
        node: 'CLOSED_LOOP_TRIAGE',
        badgeColor: 'text-[#ffa000] bg-[#ffa000]/15 border-[#ffa000]/30',
      },
      {
        phase: 'PHASE 04',
        title: 'EMS Fleet Lock & Nearest Unit Latching',
        desc: `Ambulance unit ${ambVehicle} latched at ${ambDist} km proximity. Driver HUD synced with hazard avoidance routing vector.`,
        time: '+1.20s',
        node: 'FLEET_DISPATCH_CORE',
        badgeColor: 'text-[#00daf3] bg-[#00e3fd]/15 border-[#00e3fd]/30',
      },
      {
        phase: 'PHASE 05',
        title: 'Trauma Center Preparation Broadcast',
        desc: `${hospName} (~${hospDist} km) received incident telemetry & estimated transit ETA. ${bayName}.`,
        time: '+1.65s',
        node: 'HEALTHCARE_GATEWAY',
        badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
      },
      {
        phase: 'PHASE 06',
        title: 'Traffic Signal Green Wave Priority Access',
        desc: `${signalsCount} sequential intersection traffic controllers along the corridor switched to 90s priority green corridor override.`,
        time: '+2.05s',
        node: 'SIGNAL_OVERRIDE_GRID',
        badgeColor: 'text-[#00daf3] bg-[#00e3fd]/15 border-[#00e3fd]/30',
      },
      {
        phase: 'PHASE 07',
        title: 'Corridor Optimization & ETA Confirmation',
        desc: `Dynamic routing reduced estimated transit time from ${baseEta} min to ${optEta} min (${savedMins} min saved, ${savedPercent} latency reduction). Protocol verified.`,
        time: '+2.40s',
        node: 'COMMAND_SUCCESS',
        badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
      },
    ];
  };

  const currentPhases = getDynamicPhases();

  const handleStartSimulation = async () => {
    setIsRunning(true);
    setHasCompleted(false);
    setErrorMessage(null);
    setActiveStep(0);

    try {
      // 1. Fire real backend simulation endpoint POST /api/simulation/trigger-accident
      const simResponse = await apiClient.post('/simulation/trigger-accident', {
        lat: selectedCorridor.lat,
        lng: selectedCorridor.lng,
        severity: selectedSeverity,
        location_name: selectedCorridor.name,
      });

      const simData = simResponse.data?.data;
      const opt = simData?.optimizationResult;
      const alert = simData?.alert;

      // Extract real telemetry from backend response
      const updatedTelemetry: SimulationTelemetry = {
        alert_id: alert?._id,
        corridor_name: opt?.corridor_name || selectedCorridor.name,
        lat: selectedCorridor.lat,
        lng: selectedCorridor.lng,
        severity: selectedSeverity,
        nearest_ambulance: opt?.nearest_ambulance,
        recommended_hospital: opt?.recommended_hospital,
        risk_triage: opt?.risk_triage,
        green_wave_control: opt?.green_wave_control,
        corridor_optimization: opt?.corridor_optimization,
      };

      setTelemetry(updatedTelemetry);

      // 2. Cascade closed-loop recalculation via POST /api/internal/trigger-recalculation
      try {
        await apiClient.post('/internal/trigger-recalculation', {
          event_type: 'SIMULATED_ACCIDENT_TRIGGER',
          road_name: selectedCorridor.name,
          coordinates: [selectedCorridor.lng, selectedCorridor.lat],
        });
      } catch {
        // Non-blocking closed-loop hook
      }

      // 3. Incrementally advance progression through the 7 phases with live step animation
      for (let i = 0; i < currentPhases.length; i++) {
        setActiveStep(i + 1);
        await new Promise((resolve) => setTimeout(resolve, 450));
      }

      // Refresh active alerts count
      await fetchActiveAlerts();
      setHasCompleted(true);
    } catch (err: any) {
      console.error('Simulation execution failed:', err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Error executing simulation protocol');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setActiveStep(0);
    setHasCompleted(false);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/30">
              PRAHARI PROTOCOL SIMULATION SUITE
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SANDBOX LIVE
            </span>
            {activeAlertsCount > 0 && (
              <span className="text-[10px] font-mono text-[#ffb4ab] bg-[#93000a]/30 px-2 py-0.5 rounded border border-[#ffb4ab]/30 flex items-center gap-1">
                <Bell className="w-3 h-3" />
                {activeAlertsCount} ACTIVE ALERTS
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Incident Response Simulation Center
          </h1>
          <p className="text-xs md:text-sm text-[#8c90a1]">
            Test end-to-end data triggers, smart priority check latencies, and green-corridor signal overrides in a live sandbox.
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
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#002b75]" />
                <span>Executing Protocol...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Trigger Simulated Event</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Corridor & Parameter Selection Configuration Bar */}
      <div className="bg-[#151b2b] p-4 rounded-2xl border border-white/10 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[11px] font-mono text-[#8c90a1] uppercase block mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00daf3]" />
            Target Prayagraj Corridor
          </label>
          <select
            value={selectedCorridor.name}
            disabled={isRunning}
            onChange={(e) => {
              const matched = PRAYAGRAJ_CORRIDORS.find((c) => c.name === e.target.value);
              if (matched) setSelectedCorridor(matched);
            }}
            className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00daf3] font-mono transition-colors"
          >
            {PRAYAGRAJ_CORRIDORS.map((c, idx) => (
              <option key={idx} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[#8c90a1] mt-1 line-clamp-1">{selectedCorridor.description}</p>
        </div>

        <div>
          <label className="text-[11px] font-mono text-[#8c90a1] uppercase block mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffa000]" />
            Simulated Severity Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                disabled={isRunning}
                onClick={() => setSelectedSeverity(sev)}
                className={`py-2 px-2 text-center rounded-xl text-xs font-mono font-bold transition-all border ${
                  selectedSeverity === sev
                    ? sev === 'CRITICAL'
                      ? 'bg-[#93000a]/50 border-[#ffb4ab] text-white'
                      : sev === 'HIGH'
                      ? 'bg-[#ffa000]/30 border-[#ffa000] text-white'
                      : 'bg-[#00e3fd]/20 border-[#00daf3] text-[#00daf3]'
                    : 'bg-[#0d1322] border-white/5 text-[#8c90a1] hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono text-[#8c90a1] uppercase block mb-1.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Active Route Protocol
          </label>
          <div className="bg-[#0d1322] p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
            <span className="text-[#c2c6d8] font-mono">Dynamic Green Wave</span>
            <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              OPTIMIZED
            </span>
          </div>
          <p className="text-[10px] text-[#8c90a1] mt-1 font-mono">
            GPS: {selectedCorridor.lat.toFixed(4)}°N, {selectedCorridor.lng.toFixed(4)}°E
          </p>
        </div>
      </div>

      {/* Error notification if backend request failed */}
      {errorMessage && (
        <div className="bg-[#93000a]/30 border border-[#ffb4ab]/40 rounded-xl p-3.5 flex items-center gap-3 text-xs text-[#ffdad6]">
          <AlertCircle className="w-4 h-4 text-[#ff5252] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Telemetry Status Bar (Dynamic values updated on simulation trigger) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <Cpu className="w-4 h-4 text-[#00daf3]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block">Smart Latency</span>
            <strong className="text-xs text-white font-mono">
              {telemetry?.corridor_optimization?.smart_latency_ms ?? 14.2} ms / inference
            </strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <Zap className="w-4 h-4 text-[#ffa000]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block">Signal Lock API</span>
            <strong className="text-xs text-white font-mono">
              {telemetry?.green_wave_control?.signal_lock_rate ?? '99.4%'} Synchronized
            </strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <Hospital className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block">Hospital Link</span>
            <strong className="text-xs text-white font-mono truncate max-w-[140px] block">
              {telemetry?.recommended_hospital?.trauma_bay || 'Apollo Bay 02 Armed'}
            </strong>
          </div>
        </div>

        <div className="bg-[#151b2b] p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <Activity className="w-4 h-4 text-[#ff5252]" />
          <div>
            <span className="text-[10px] font-mono text-[#8c90a1] block">Time Saved</span>
            <strong className="text-xs text-[#00daf3] font-mono">
              {telemetry?.corridor_optimization?.time_saved_mins ?? 6} min (
              {telemetry?.corridor_optimization?.latency_reduction ?? '33.3%'})
            </strong>
          </div>
        </div>
      </div>

      {/* 7-Step Interactive Progression Timeline */}
      <div className="bg-[#151b2b] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Radio className={`w-4 h-4 text-[#00daf3] ${isRunning ? 'animate-pulse' : ''}`} />
            Execution Pipeline Data Info Stream
          </h3>
          <span className="text-xs font-mono text-[#00daf3]">
            Step {activeStep} of {currentPhases.length}
          </span>
        </div>

        <div className="space-y-3">
          {currentPhases.map((phase, idx) => {
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
                    <span className="font-mono text-xs font-bold text-[#8c90a1]">{phase.phase}</span>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {phase.title}
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </h4>
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
