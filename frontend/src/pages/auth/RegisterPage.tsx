import React, { useEffect, useState } from 'react';
import { Lock, Sparkles, Zap } from 'lucide-react';
import { InfrastructureMap } from '../../components/auth/InfrastructureMap';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { SystemStatus } from '../../components/auth/SystemStatus';

export const RegisterPage: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050811] text-[#dde2f8] flex flex-col justify-between overflow-x-hidden selection:bg-[#00e3fd]/30 selection:text-[#00e3fd]">
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-60"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(0, 227, 253, 0.07), transparent 80%)`,
        }}
      />
      <div className="absolute inset-0 grid-pattern-dense opacity-20 pointer-events-none" />

      <header className="relative z-20 w-full border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-[0_0_20px_rgba(0,227,253,0.3)]">
            <div className="w-full h-full bg-[#080d17] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#00e3fd]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white">PRAHARI</span>
              <span className="text-[10px] font-mono font-bold text-[#00e3fd] bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/40">
                AI NETWORK
              </span>
            </div>
            <div className="text-[8.5px] font-mono tracking-widest text-slate-400 uppercase">
              ROADGUARD INTELLIGENCE PLATFORM · SIH 2026
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-[10px] font-mono">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              NATIONAL HIGHWAY SENSOR GRID: <strong className="text-emerald-400">99.8% ONLINE</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[#00e3fd]">
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline font-bold">CLEARANCE NODE</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8 justify-center">
        <div className="w-full lg:w-[58%] flex flex-col">
          <div className="flex-1 flex flex-col">
            <InfrastructureMap />
          </div>
        </div>

        <div className="w-full lg:w-[42%] max-w-xl mx-auto flex flex-col justify-center">
          <div className="relative rounded-3xl bg-[#090f1d]/90 backdrop-blur-2xl border border-slate-700/80 p-5 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-5">
            <div className="absolute -top-[1px] inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#00e3fd] to-transparent" />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-[#00e3fd] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  AI INFRASTRUCTURE ACCESS
                </div>
                <span className="text-[10px] font-mono text-slate-400">NODE #IN-HQ-01</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-wide pt-1">
                SECURE ACCOUNT REGISTRATION
              </h1>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Create your Prahari AI identity using official credentials to access real-time road intelligence and command workflows.
              </p>
            </div>

            <RegisterForm />
            <SystemStatus />
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full border-t border-slate-900 bg-[#050811] px-4 py-2.5 text-center text-[10px] font-mono text-slate-500">
        PRAHARI AI NETWORK · SMART INDIA HACKATHON · MINISTRY OF ROAD TRANSPORT & HIGHWAYS / NHAI · NATIONAL TRAFFIC INTELLIGENCE
      </footer>
    </div>
  );
};
