import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  Truck,
  Activity,
  Hospital,
  Zap,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  PhoneCall,
  Volume2,
  Navigation,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { MOCK_EMERGENCY_INCIDENTS, MOCK_FIELD_TEAMS } from '../../data/mockData';
import { EmergencyIncident } from '../../types';

export const EmergencyOperations: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(MOCK_EMERGENCY_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident>(MOCK_EMERGENCY_INCIDENTS[0]);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [signalPreempted, setSignalPreempted] = useState(true);

  // Animated vehicle positions simulation
  const [vehicleOffsets, setVehicleOffsets] = useState({ emsX: 42, emsY: 58, polX: 55, polY: 48 });

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleOffsets((prev) => ({
        emsX: prev.emsX > 80 ? 30 : prev.emsX + 0.8,
        emsY: prev.emsY < 30 ? 65 : prev.emsY - 0.4,
        polX: prev.polX < 20 ? 70 : prev.polX - 0.6,
        polY: prev.polY > 75 ? 40 : prev.polY + 0.5,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatchConfirm = () => {
    setDispatchSuccess(true);
    setTimeout(() => {
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === selectedIncident.id ? { ...inc, status: 'Dispatched' as const } : inc
        )
      );
      setSelectedIncident((prev) => ({ ...prev, status: 'Dispatched' as const }));
      setDispatchSuccess(false);
      setDispatchModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-5 pb-20 pt-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              LIVE EMERGENCY OPERATIONS CENTER
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Emergency Response Operations
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Coordinate incidents, emergency vehicles, routes and field resources in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/authority/emergency-routes')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-950 text-[#00e3fd] font-mono text-xs font-semibold border border-cyan-500/40 transition-all shadow-[0_0_15px_rgba(0,227,253,0.15)]"
          >
            <Navigation className="w-4 h-4" />
            <span>Green Wave Corridors</span>
          </button>
          <button
            onClick={() => navigate('/authority/simulation')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold border border-slate-700 transition-all"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Protocol Simulator</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0e1626] p-4 rounded-xl border border-red-500/30 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE INCIDENTS</div>
          <div className="text-2xl font-black text-white mt-1 font-mono flex items-center gap-2">
            <span>08</span>
            <span className="text-xs font-normal text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
              Live Feed
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">3 Critical · 5 High priority</div>
        </div>

        <div className="bg-[#0e1626] p-4 rounded-xl border border-cyan-500/30 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">EMERGENCY UNITS</div>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">
            24
          </div>
          <div className="text-[10px] font-mono text-cyan-300 mt-1">12 Ambulances · 8 Police · 4 Heavy Pavers</div>
        </div>

        <div className="bg-[#0e1626] p-4 rounded-xl border border-purple-500/30 shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase">AVG RESPONSE TIME</div>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">
            12.4 <span className="text-xs font-normal text-slate-400">MIN</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">33.3% faster than standard dispatch</div>
        </div>

        <div className="bg-[#0e1626] p-4 rounded-xl border border-red-500/50 shadow-lg bg-red-950/20">
          <div className="text-[10px] font-mono text-red-400 uppercase font-bold">CRITICAL INCIDENTS</div>
          <div className="text-2xl font-black text-red-400 mt-1 font-mono animate-pulse">
            03
          </div>
          <div className="text-[10px] font-mono text-red-300 mt-1">Requires immediate lane closure</div>
        </div>
      </div>

      {/* Main 3-Column Mission Control Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: LIVE INCIDENT QUEUE (3.5 Cols) */}
        <div className="lg:col-span-4 bg-[#0e1626] p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Incident Queue
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {incidents.length} IN QUEUE
              </span>
            </div>

            <div className="space-y-3">
              {incidents.map((incident) => {
                const isSelected = selectedIncident.id === incident.id;
                return (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {incident.id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {incident.detectedTime}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white line-clamp-1">
                      {incident.title}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span>{incident.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-800/60">
                      <span className="text-red-400 font-bold">Risk: {incident.riskScore}/100</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          incident.status === 'Dispatched'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : incident.status === 'On Scene'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setDetailModalOpen(true)}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Open Incident Operational Workspace</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* CENTER COLUMN: LIVE TACTICAL OPERATIONS MAP (4.5 Cols) */}
        <div className="lg:col-span-4 bg-[#080d17] p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[480px]">
          {/* Tactical Vector Grid Background */}
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80')`,
            }}
          />

          {/* Map Top Telemetry Strip */}
          <div className="relative z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-bold">GRID GPS: ACTIVE</span>
            </div>
            <div className="text-cyan-400">
              Corridor B: Green Wave
            </div>
            <div className="text-slate-400">
              Preempt: 9 Signals
            </div>
          </div>

          {/* Map Canvas with Animated Vehicles & Incident Pulsing Markers */}
          <div className="relative z-10 flex-1 my-4 flex items-center justify-center min-h-[300px]">
            {/* SVG Corridor Vector Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Green Wave Path */}
              <path
                d="M 60 220 Q 180 140 280 90 T 360 40"
                fill="none"
                stroke="#00e3fd"
                strokeWidth="3"
                strokeDasharray="6,4"
                className="animate-pulse"
              />
              {/* Traffic Congestion Zone */}
              <circle cx="160" cy="180" r="38" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
            </svg>

            {/* Pulsing Active Incident Marker (Center/Target) */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative">
                <span className="absolute -inset-3 rounded-full bg-red-500/30 animate-ping"></span>
                <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.8)] border-2 border-white">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 bg-slate-900/95 text-white font-mono text-[9px] px-2 py-1 rounded border border-red-500 shadow-xl whitespace-nowrap">
                {selectedIncident.id} · {selectedIncident.location.split(',')[0]}
              </div>
            </div>

            {/* Dynamic Moving Vehicle 1: Ambulance EMS-42 */}
            <div
              className="absolute transition-all duration-1000 flex flex-col items-center"
              style={{ top: `${vehicleOffsets.emsY}%`, left: `${vehicleOffsets.emsX}%` }}
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500 text-[#001738] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,227,253,0.8)] border border-white">
                <Hospital className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-mono bg-slate-900/90 text-cyan-300 px-1 rounded mt-0.5 border border-cyan-500/30">
                EMS-42 (7m)
              </span>
            </div>

            {/* Dynamic Moving Vehicle 2: Police Interceptor */}
            <div
              className="absolute transition-all duration-1000 flex flex-col items-center"
              style={{ top: `${vehicleOffsets.polY}%`, left: `${vehicleOffsets.polX}%` }}
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,130,246,0.8)] border border-white">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-mono bg-slate-900/90 text-blue-300 px-1 rounded mt-0.5 border border-blue-500/30">
                POL-14 (4m)
              </span>
            </div>
          </div>

          {/* Map Bottom Action Bar */}
          <div className="relative z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e3fd]"></span>
              <span className="text-slate-300 font-mono text-[11px]">Apollo Trauma Bay Ready</span>
            </div>
            <button
              onClick={() => setSignalPreempted(!signalPreempted)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                signalPreempted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {signalPreempted ? '✓ GREEN WAVE ARMED' : 'ARM SIGNALS'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: INCIDENT COMMAND PANEL (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0e1626] p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase">
                  INCIDENT COMMAND DISPATCH
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedIncident.title}
                </h3>
                <div className="text-xs text-slate-400">{selectedIncident.location}</div>
              </div>
              <span className="text-lg font-mono font-black text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                {selectedIncident.riskScore}/100
              </span>
            </div>

            {/* Impact Telemetry Chips */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">AFFECTED LANES</div>
                <div className="text-base font-bold text-red-400 mt-0.5">
                  {selectedIncident.affectedLanes} Lanes Blocked
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">EST. TRAFFIC IMPACT</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  +{selectedIncident.estimatedTrafficDelayMin} min delay
                </div>
              </div>
            </div>

            {/* Recommended AI Response Plan Checklist */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                AI RECOMMENDED RESPONSE PROTOCOL:
              </span>
              <div className="space-y-1.5 text-xs text-slate-300">
                {selectedIncident.recommendedActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold mt-0.5">
                      0{idx + 1}
                    </span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Emergency Units */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                ASSIGNED RESPONSE UNITS:
              </span>
              <div className="space-y-1.5">
                {selectedIncident.assignedUnits.map((unit) => (
                  <div key={unit.unitId} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-white">{unit.callsign}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      ETA <strong className="text-emerald-400">{unit.etaMin}m</strong> ({unit.distanceKm}km)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => setDispatchModalOpen(true)}
              className={`w-full py-3 px-4 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                selectedIncident.status === 'Dispatched'
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-red-500/20 animate-pulse'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>
                {selectedIncident.status === 'Dispatched'
                  ? '✓ DISPATCH CONFIRMED (LIVE EN ROUTE)'
                  : 'DISPATCH RESPONSE SQUAD & GREEN WAVE'}
              </span>
            </button>

            <button
              onClick={() => navigate('/authority/simulation')}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate Incident Corridor Closure</span>
            </button>
          </div>
        </div>
      </div>

      {/* DISPATCH CONFIRMATION MODAL */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-red-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-base font-bold text-white uppercase">
                  Confirm Emergency Dispatch
                </h3>
              </div>
              <button onClick={() => setDispatchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div>Incident ID: <strong className="text-white font-mono">{selectedIncident.id}</strong></div>
                <div>Location: <strong className="text-white">{selectedIncident.location}</strong></div>
                <div>Target Hospital: <strong className="text-cyan-400">Apollo / AIIMS Trauma Center</strong></div>
                <div>Signal Preemption: <strong className="text-emerald-400">9 Synchronized Nodes Armed</strong></div>
              </div>

              {dispatchSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-center space-y-1 text-emerald-300">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                  <div className="font-bold text-sm">✓ DISPATCH ACTIVE</div>
                  <div className="text-[11px]">Green corridor preempted. Hospital trauma bay notified.</div>
                </div>
              ) : (
                <p className="text-slate-400">
                  Authorizing this dispatch will immediately switch traffic controllers on Corridor B to Green Wave priority and mobilize Apex LifeSupport 42.
                </p>
              )}
            </div>

            {!dispatchSuccess && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDispatchModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatchConfirm}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  <span>Authorize Dispatch</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL OPERATIONAL WORKSPACE MODAL (Section 11) */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1626] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400">{selectedIncident.id} · OPERATIONAL WORKSPACE</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedIncident.title}</h2>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 6-Phase Response Plan */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
                AI GENERATED 6-PHASE RESPONSE PLAN:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { num: '01', title: 'Secure Affected Zone', desc: 'Deploy automated VMS message signs and traffic cones' },
                  { num: '02', title: 'Dispatch Nearest Unit', desc: 'Mobilize Apex LifeSupport 42 (ETA 7 min)' },
                  { num: '03', title: 'Activate Emergency Corridor', desc: 'Lock 9 traffic signals on Route B to continuous green wave' },
                  { num: '04', title: 'Notify Trauma Center', desc: 'Pre-register trauma bay at Apollo/AIIMS Hospital' },
                  { num: '05', title: 'Deploy Maintenance Crew', desc: 'Assign NHAI Heavy Paver Squad 1 for subgrade compaction' },
                  { num: '06', title: 'Monitor Incident Closure', desc: 'Optical computer vision verification of structural repair' },
                ].map((step) => (
                  <div key={step.num} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-600/30 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                        {step.num}
                      </span>
                      <span className="text-xs font-bold text-white">{step.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-7">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Teams Allocation */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
                AVAILABLE FIELD RESPONSE SQUADS:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MOCK_FIELD_TEAMS.slice(0, 3).map((team) => (
                  <div key={team.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{team.name}</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1 rounded">
                        {team.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Lead: {team.leadName}</div>
                    <div className="text-[11px] text-cyan-400 font-mono">ETA: {team.etaMin} min away</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
