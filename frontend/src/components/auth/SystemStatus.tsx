import React from 'react';
import { ShieldCheck, Lock, Activity, Globe, Cpu } from 'lucide-react';

export const SystemStatus: React.FC = () => {
  return (
    <div className="space-y-3 pt-3 border-t border-slate-800/80">
      {/* System Security Features Row */}
      <div className="space-y-1.5">
        <div className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
          <Lock className="w-3 h-3 text-cyan-400" />
          SYSTEM SECURITY & GOVERNANCE
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>TLS-1.3 ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>AI NEURAL AUTH</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>RBAC ACCESS TIER</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>LIVE AUDIT LOGS</span>
          </div>
        </div>
      </div>

      {/* Global Bottom Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-slate-400 pt-2 border-t border-slate-800/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">PRAHARI NETWORK:</span>
          <span className="text-emerald-400">OPERATIONAL</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>AI CORE: <strong className="text-cyan-400">ONLINE</strong></span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1 text-slate-400">
            <Globe className="w-3 h-3 text-blue-400" />
            <span>GRID: <strong className="text-blue-400">CONNECTED</strong></span>
          </div>
          <span>|</span>
          <span className="text-slate-400">VER 2.0 (SIH)</span>
        </div>
      </div>
    </div>
  );
};
