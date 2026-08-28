import React from 'react';
import { Shield, Radio, Navigation, CheckCircle2, AlertTriangle, Hospital, Flame } from 'lucide-react';
import { EmergencyRouteOption } from '../../types';

interface RouteOptimizationMapProps {
  selectedRouteId: 'A' | 'B' | 'C';
  onSelectRoute: (id: 'A' | 'B' | 'C') => void;
  routes: EmergencyRouteOption[];
}

export const RouteOptimizationMap: React.FC<RouteOptimizationMapProps> = ({
  selectedRouteId,
  onSelectRoute,
  routes,
}) => {
  return (
    <div className="relative w-full h-[420px] lg:h-[500px] bg-[#080e1d] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Dark Tactical Grid Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1600&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-[#0d1322]/70" />
      <div className="absolute inset-0 grid-pattern-dense opacity-40" />

      {/* SVG Vector Paths for Routes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeAGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="100%" stopColor="#ffb4ab" />
          </linearGradient>
          <linearGradient id="routeBGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00daf3" />
            <stop offset="100%" stopColor="#bdf4ff" />
          </linearGradient>
          <linearGradient id="routeCGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffa000" />
            <stop offset="100%" stopColor="#ffd180" />
          </linearGradient>
          <filter id="glowA">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowB">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Route C Path (Outer Bypass) */}
        <path
          d="M 120 400 Q 220 450 420 420 T 700 130"
          fill="none"
          stroke="url(#routeCGrad)"
          strokeWidth={selectedRouteId === 'C' ? '5' : '3'}
          strokeDasharray={selectedRouteId === 'C' ? 'none' : '4 4'}
          opacity={selectedRouteId === 'C' ? 1 : 0.4}
          className="cursor-pointer transition-all hover:opacity-100"
          onClick={() => onSelectRoute('C')}
        />

        {/* Route A Path (Shortest Direct with Bottleneck) */}
        <path
          d="M 120 400 Q 300 320 450 260 T 700 130"
          fill="none"
          stroke="url(#routeAGrad)"
          strokeWidth={selectedRouteId === 'A' ? '6' : '3.5'}
          strokeDasharray={selectedRouteId === 'A' ? 'none' : '6 4'}
          opacity={selectedRouteId === 'A' ? 1 : 0.45}
          filter={selectedRouteId === 'A' ? 'url(#glowA)' : undefined}
          className="cursor-pointer transition-all hover:opacity-100"
          onClick={() => onSelectRoute('A')}
        />

        {/* Route B Path (Recommended AI Green Corridor with Animated Pulse) */}
        <path
          d="M 120 400 Q 250 180 480 180 T 700 130"
          fill="none"
          stroke="url(#routeBGrad)"
          strokeWidth={selectedRouteId === 'B' ? '7' : '4'}
          opacity={selectedRouteId === 'B' ? 1 : 0.6}
          filter="url(#glowB)"
          className="cursor-pointer transition-all hover:opacity-100"
          onClick={() => onSelectRoute('B')}
        />

        {/* Animated Green Wave Pulse Particles along Route B */}
        <circle r="4" fill="#00daf3" className="filter drop-shadow-[0_0_8px_#00daf3]">
          <animateMotion
            path="M 120 400 Q 250 180 480 180 T 700 130"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="3" fill="#bdf4ff">
          <animateMotion
            path="M 120 400 Q 250 180 480 180 T 700 130"
            dur="4s"
            begin="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Origin Node: Ambulance / EMS Unit */}
      <div className="absolute bottom-16 left-16 z-20 flex flex-col items-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#0066ff]/20 animate-ping absolute" />
          <div className="w-10 h-10 rounded-full bg-[#0066ff] border-2 border-white flex items-center justify-center text-white shadow-[0_0_15px_#0066ff]">
            <Radio className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-1 bg-[#151b2b]/90 border border-[#b3c5ff]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#b3c5ff]">
          ORIGIN: UNIT EMS-42
        </div>
      </div>

      {/* Destination Node: Apollo / AIIMS Trauma Center */}
      <div className="absolute top-16 right-16 z-20 flex flex-col items-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 animate-ping absolute" />
          <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-[0_0_15px_#10b981]">
            <Hospital className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-1 bg-[#151b2b]/90 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300">
          DESTINATION: TRAUMA HQ
        </div>
      </div>

      {/* Bottleneck Marker on Route A */}
      <div className="absolute top-[52%] left-[45%] z-20 flex items-center gap-1.5 bg-[#93000a]/90 border border-[#ffb4ab]/50 px-2 py-1 rounded shadow-xl backdrop-blur-md">
        <AlertTriangle className="w-3.5 h-3.5 text-[#ffb4ab] animate-pulse" />
        <span className="text-[10px] font-mono text-[#ffdad6] font-bold">
          ROUTE A HAZARD: ROADWORK & SUBSIDENCE
        </span>
      </div>

      {/* Interactive Floating Route Selector Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md border ${
                isSelected
                  ? route.isRecommended
                    ? 'bg-[#00e3fd]/20 text-[#00daf3] border-[#00e3fd]/60 shadow-[0_0_15px_rgba(0,227,253,0.4)]'
                    : 'bg-[#ff5252]/20 text-[#ffb4ab] border-[#ffb4ab]/60 shadow-[0_0_15px_rgba(255,180,171,0.4)]'
                  : 'bg-[#151b2b]/80 text-[#8c90a1] border-white/10 hover:bg-[#242a3a]'
              }`}
            >
              <span>Route {route.id}</span>
              <span className="text-[10px] opacity-80">({route.estimatedEtaMin}m)</span>
              {route.isRecommended && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Data Info Live Badge */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151b2b]/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#8c90a1]">
        <span className="w-2 h-2 rounded-full bg-[#00daf3] animate-pulse"></span>
        SIGNAL PREEMPTION: 9 NODES ARMED
      </div>
    </div>
  );
};
