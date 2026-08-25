import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Sparkles, CheckCircle2, Cpu, Globe } from 'lucide-react';
import { UserRole } from '../../types';
import { ROLE_PRESETS } from '../../services/authService';

interface AuthTransitionProps {
  role: UserRole;
  onComplete: () => void;
}

export const AuthTransition: React.FC<AuthTransitionProps> = ({ role, onComplete }) => {
  const [phase, setPhase] = useState<'verifying' | 'granted' | 'routing'>('verifying');
  const preset = ROLE_PRESETS[role];

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('granted');
    }, 450);

    const t2 = setTimeout(() => {
      setPhase('routing');
    }, 950);

    const t3 = setTimeout(() => {
      onComplete();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Animated Central Emblem */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="absolute -inset-2 rounded-full border border-cyan-500/30 animate-ping" />
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-[2px] shadow-[0_0_40px_rgba(0,227,253,0.5)]">
            <div className="w-full h-full bg-[#080d17] rounded-full flex items-center justify-center">
              {phase === 'verifying' ? (
                <Cpu className="w-10 h-10 text-[#00e3fd] animate-pulse" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              )}
            </div>
          </div>
        </div>

        {/* Phase Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            PRAHARI NEURAL CLEARANCE
          </div>

          <h2 className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider">
            {phase === 'verifying'
              ? 'VERIFYING BIOMETRICS & PERMISSIONS...'
              : phase === 'granted'
              ? 'PRAHARI NETWORK ACCESS GRANTED'
              : 'INITIALIZING COMMAND VIEWPORT...'}
          </h2>

          <p className="text-xs font-mono text-slate-300">
            Routing to <strong className="text-cyan-400">{preset.title}</strong> ({preset.targetRoute})
          </p>
        </div>

        {/* Progress Matrix Loader */}
        <div className="space-y-1.5 max-w-xs mx-auto">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-500"
              style={{
                width: phase === 'verifying' ? '45%' : phase === 'granted' ? '85%' : '100%',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>CLEARANCE: {preset.badge}</span>
            <span className="text-emerald-400">GOV-ENCRYPTED 256</span>
          </div>
        </div>
      </div>
    </div>
  );
};
