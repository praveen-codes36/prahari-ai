import React, { useState, useEffect } from 'react';
import { Activity, Navigation, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TelemetryItem {
  title: string;
  stat: string;
  sub: string;
  color: string;
  border: string;
}

const TELEMETRY_ITEMS: TelemetryItem[] = [
  {
    title: 'DELHI NCR INFRASTRUCTURE',
    stat: 'RISK INDEX 28',
    sub: 'NH-48 SENSORS ONLINE · 42K VPD',
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
  },
  {
    title: 'MUMBAI METRO CORRIDOR',
    stat: 'POTHOLE SURGE +24%',
    sub: 'AI DRONE SWARM DEPLOYED ON WEH',
    color: 'text-red-400',
    border: 'border-red-500/40',
  },
  {
    title: 'BENGALURU SMART VIADUCT',
    stat: 'NETWORK HEALTH 94%',
    sub: 'ADAPTIVE PREEMPTION IN SYNC',
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  {
    title: 'LIVE UNIT EMS-42',
    stat: 'PREEMPTION ACTIVE',
    sub: 'ETA 12 MIN · 9 GREEN SIGNALS PREEMPTED',
    color: 'text-amber-400',
    border: 'border-amber-500/40',
  },
  {
    title: 'FIELD SQUAD ALPHA',
    stat: 'DISPATCHED ON-SITE',
    sub: 'RAPID VOID POLYMER FILL IN PROGRESS',
    color: 'text-blue-400',
    border: 'border-blue-500/40',
  },
];

export const MapTelemetry: React.FC = () => {
  const [activeTelemetryIndex, setActiveTelemetryIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTelemetryIndex((prev) => (prev + 1) % TELEMETRY_ITEMS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const currentItem = TELEMETRY_ITEMS[activeTelemetryIndex];

  return (
    <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
      {/* Rotating Live Data Info Carousel */}
      <div
        className={`p-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border ${currentItem.border} shadow-lg flex items-center justify-between transition-all duration-500`}
      >
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
              {currentItem.title}
            </span>
          </div>
          <div className={`text-xs font-mono font-black ${currentItem.color}`}>
            {currentItem.stat}
          </div>
          <div className="text-[9px] font-mono text-slate-400">
            {currentItem.sub}
          </div>
        </div>
        <Activity className="w-5 h-5 text-cyan-400/70" />
      </div>

      {/* Emergency Priority Access Live Corridor Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-blue-950/50 backdrop-blur-xl border border-cyan-500/40 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Navigation className="w-3.5 h-3.5 text-[#00e3fd] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase text-[#00e3fd]">
              AI ROUTE OPTIMIZED (EMS-42)
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-white">
            MUMBAI → PUNE → HYDERABAD
          </div>
          <div className="text-[9px] font-mono text-emerald-400">
            ETA: 12 MIN · 9 SIGNALS PREEMPTED (6 MIN SAVED)
          </div>
        </div>
        <span className="text-[9px] font-mono font-black text-[#001738] bg-[#00e3fd] px-2.5 py-1 rounded-lg">
          GREEN WAVE
        </span>
      </div>
    </div>
  );
};
