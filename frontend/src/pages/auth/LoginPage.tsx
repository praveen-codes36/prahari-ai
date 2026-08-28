import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, ShieldCheck, Sparkles, Radio, Activity, Globe, Lock } from 'lucide-react';
import { UserRole } from '../../types';
import { InfrastructureMap } from '../../components/auth/InfrastructureMap';
import { RoleSelector } from '../../components/auth/RoleSelector';
import { LoginForm } from '../../components/auth/LoginForm';
import { SystemStatus } from '../../components/auth/SystemStatus';
import { AuthTransition } from '../../components/auth/AuthTransition';
import { ROLE_PRESETS, authService } from '../../services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated and visiting /login directly, allow quick entry or stay to switch
  const [selectedRole, setSelectedRole] = useState<UserRole>('authority');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetRedirectRole, setTargetRedirectRole] = useState<UserRole>('authority');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Ambient mouse light tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAuthSuccess = (role: UserRole) => {
    setTargetRedirectRole(role);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    const preset = ROLE_PRESETS[targetRedirectRole];
    navigate(preset.targetRoute, { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050811] text-[#dde2f8] flex flex-col justify-between overflow-x-hidden selection:bg-[#00e3fd]/30 selection:text-[#00e3fd]">
      {/* Background Interactive Ambient Lighting Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-60"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(0, 227, 253, 0.07), transparent 80%)`,
        }}
      />
      <div className="absolute inset-0 grid-pattern-dense opacity-20 pointer-events-none" />

      {/* Top Universal Navbar / Command Banner */}
      <header className="relative z-20 w-full border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-[0_0_20px_rgba(0,227,253,0.3)]">
            <div className="w-full h-full bg-[#080d17] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#00e3fd]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white">
                PRAHARI
              </span>
              <span className="text-[10px] font-mono font-bold text-[#00e3fd] bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/40">
                AI NETWORK
              </span>
            </div>
            <div className="text-[8.5px] font-mono tracking-widest text-slate-400 uppercase">
              ROADGUARD INTELLIGENCE PLATFORM · SIH 2026
            </div>
          </div>
        </div>

        {/* Top Right Live Satellite Data Info */}
        <div className="flex items-center gap-2 sm:gap-4 text-[10px] font-mono">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NATIONAL HIGHWAY SENSOR GRID: <strong className="text-emerald-400">99.8% ONLINE</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[#00e3fd]">
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline font-bold">CLEARANCE NODE</span>
          </div>
        </div>
      </header>

      {/* Main Two-Column Viewport: Left Map (Hero) + Right Login Panel */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8 justify-center">
        {/* Left Column: Hero India Road Network Animated Map (58%) */}
        <div className="w-full lg:w-[58%] flex flex-col">
          <div className="flex-1 flex flex-col">
            <InfrastructureMap />
          </div>
        </div>

        {/* Right Column: Premium Command Center Login Card (42%) */}
        <div className="w-full lg:w-[42%] max-w-xl mx-auto flex flex-col justify-center">
          <div className="relative rounded-3xl bg-[#090f1d]/90 backdrop-blur-2xl border border-slate-700/80 p-5 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-5">
            {/* Ambient Cyan Glow Line on Top of Card */}
            <div className="absolute -top-[1px] inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#00e3fd] to-transparent" />

            {/* Header / System Access Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-[#00e3fd] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  AI INFRASTRUCTURE ACCESS
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  NODE #IN-HQ-01
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-wide pt-1">
                SECURE SYSTEM ACCESS
              </h1>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Authenticate your departmental credentials to access real-time road network smart system, emergency routes & automated priority check.
              </p>
            </div>

            {/* Role Selection Matrix */}
            <RoleSelector
              selectedRole={selectedRole}
              onSelectRole={(role) => setSelectedRole(role)}
            />

            {/* Authentication Form */}
            <LoginForm
              selectedRole={selectedRole}
              onSuccess={handleAuthSuccess}
            />

            {/* Security Notice & Operational Data Info Footer */}
            <SystemStatus />
          </div>
        </div>
      </main>

      {/* Cinematic Auth Success Transition Overlay */}
      {isTransitioning && (
        <AuthTransition
          role={targetRedirectRole}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Compact Global Bottom Footer */}
      <footer className="relative z-10 w-full border-t border-slate-900 bg-[#050811] px-4 py-2.5 text-center text-[10px] font-mono text-slate-500">
        PRAHARI AI NETWORK · SMART INDIA HACKATHON · MINISTRY OF ROAD TRANSPORT & HIGHWAYS / NHAI · NATIONAL TRAFFIC INTELLIGENCE
      </footer>
    </div>
  );
};
