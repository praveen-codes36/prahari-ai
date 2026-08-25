import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { UserRole } from '../../types';
import { ROLE_PRESETS, authService } from '../../services/authService';

interface LoginFormProps {
  selectedRole: UserRole;
  onSuccess: (role: UserRole) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ selectedRole, onSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'idle' | 'authenticating' | 'granted'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Sync role default credentials whenever role changes
  useEffect(() => {
    const preset = ROLE_PRESETS[selectedRole];
    setIdentifier(preset.defaultEmail);
    setPassword('prahari@2026');
    setErrorMessage(null);
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please provide an Official Email or Employee ID.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your authentication security key / password.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('authenticating');

    try {
      // Authenticate via service
      await authService.login(identifier, password, selectedRole, rememberMe);

      // Transition to granted
      setTimeout(() => {
        setLoadingStep('granted');
        setTimeout(() => {
          onSuccess(selectedRole);
        }, 600);
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setLoadingStep('idle');
      setErrorMessage(err?.message || 'AUTHENTICATION FAILED. Verify credentials and try again.');
    }
  };

  const currentPreset = ROLE_PRESETS[selectedRole];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Inline Error Notification */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-mono font-bold uppercase text-[10px] text-red-400">
              AUTHENTICATION REJECTED
            </div>
            <div className="text-[11px] mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Email / Employee ID Field */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            EMAIL / EMPLOYEE ID
          </span>
          <span className="text-[9px] text-slate-400 lowercase font-normal">
            ID: {currentPreset.defaultEmployeeId}
          </span>
        </label>

        <div className="relative">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. officer@prahari.gov.in"
            disabled={isLoading}
            className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#00e3fd] focus:ring-1 focus:ring-[#00e3fd]/50 transition-all"
            required
          />
        </div>
      </div>

      {/* Password Key Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            PASSWORD / SECURITY KEY
          </label>
          <button
            type="button"
            onClick={() => setShowForgotPasswordModal(true)}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
          >
            Forgot key?
          </button>
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter security key"
            disabled={isLoading}
            className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#00e3fd] focus:ring-1 focus:ring-[#00e3fd]/50 transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Remember Device & Security Level */}
      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-[#00e3fd] focus:ring-0 focus:ring-offset-0 accent-[#00e3fd]"
          />
          <span className="text-[11px] font-mono text-slate-300">
            Remember this terminal
          </span>
        </label>

        <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
          <KeyRound className="w-3 h-3 text-cyan-400" />
          GOV-256 ENCRYPTED
        </span>
      </div>

      {/* Primary Action Button: AUTHENTICATE & ENTER */}
      <button
        type="submit"
        disabled={isLoading}
        className={`relative w-full overflow-hidden rounded-xl p-[1px] font-mono font-bold text-xs transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.99] ${
          loadingStep === 'granted'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
            : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:shadow-[0_0_25px_rgba(0,227,253,0.4)]'
        }`}
      >
        <div
          className={`w-full py-3 px-4 rounded-[11px] flex items-center justify-center gap-2 transition-all ${
            loadingStep === 'granted'
              ? 'bg-emerald-600 text-white font-black'
              : isLoading
              ? 'bg-[#080d1a] text-cyan-300'
              : 'bg-[#090f20] hover:bg-[#0c1630] text-white'
          }`}
        >
          {loadingStep === 'authenticating' ? (
            <>
              <Cpu className="w-4 h-4 text-[#00e3fd] animate-spin" />
              <span className="tracking-widest text-[#00e3fd]">
                AUTHENTICATING WITH PRAHARI AI...
              </span>
            </>
          ) : loadingStep === 'granted' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="tracking-widest">
                IDENTITY VERIFIED · ACCESS GRANTED
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#00e3fd]" />
              <span className="tracking-wider">AUTHENTICATE & ENTER COMMAND HQ</span>
              <ArrowRight className="w-4 h-4 text-[#00e3fd] ml-1 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </div>
      </button>

      {/* Quick 1-Click Evaluation Chips for SIH Judges */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono uppercase text-slate-400">
            DEMO QUICK-FILL PRESETS:
          </span>
          <span className="text-[9px] font-mono text-cyan-400">Instant Test</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIdentifier(ROLE_PRESETS.authority.defaultEmail);
              setPassword('prahari@2026');
            }}
            className="px-2 py-1 rounded bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-[9px] font-mono text-slate-300 hover:text-cyan-300 transition-colors"
          >
            🏛️ Authority HQ
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifier(ROLE_PRESETS.emergency.defaultEmail);
              setPassword('prahari@2026');
            }}
            className="px-2 py-1 rounded bg-slate-900/80 hover:bg-red-950/60 border border-slate-800 hover:border-red-500/50 text-[9px] font-mono text-slate-300 hover:text-red-300 transition-colors"
          >
            ⚡ EMS 108
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifier(ROLE_PRESETS.maintenance.defaultEmail);
              setPassword('prahari@2026');
            }}
            className="px-2 py-1 rounded bg-slate-900/80 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/50 text-[9px] font-mono text-slate-300 hover:text-amber-300 transition-colors"
          >
            🔧 Squad Lead
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifier(ROLE_PRESETS.citizen.defaultEmail);
              setPassword('prahari@2026');
            }}
            className="px-2 py-1 rounded bg-slate-900/80 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 text-[9px] font-mono text-slate-300 hover:text-emerald-300 transition-colors"
          >
            ◉ Citizen
          </button>
        </div>
      </div>

      {/* Forgot Password Modal Helper */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d1424] border border-slate-700 rounded-2xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-cyan-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-mono font-bold uppercase text-white">
                Credential Reset Dispatch
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              In this Smart India Hackathon demo environment, all authorized profiles use standard clearance key <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">prahari@2026</code>.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>• Authority: <span className="text-cyan-300">commissioner.pwd@prahari.gov.in</span></div>
              <div>• EMS Ops: <span className="text-red-300">dispatcher.ems42@prahari.gov.in</span></div>
              <div>• Field Lead: <span className="text-amber-300">lead.alpha@prahari.gov.in</span></div>
              <div>• Citizen: <span className="text-emerald-300">citizen.praveen@roadguard.org</span></div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#00e3fd] text-[#001738] text-xs font-mono font-bold hover:bg-cyan-300 transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
