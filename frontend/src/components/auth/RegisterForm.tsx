import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '../../services/authService';

type RegisterRole = 'CITIZEN' | 'AUTHORITY' | 'EMERGENCY' | 'ADMIN';

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: RegisterRole;
  department_id: string;
}

type FormErrors = Partial<Record<keyof RegisterFormState, string>> & {
  general?: string;
};

const ROLE_OPTIONS: { value: RegisterRole; label: string; badge: string }[] = [
  { value: 'AUTHORITY', label: 'AUTHORITY HQ', badge: 'PWD / NHAI' },
  { value: 'EMERGENCY', label: 'EMERGENCY OPS', badge: 'EMS 108' },
  { value: 'CITIZEN', label: 'CITIZEN', badge: 'PUBLIC' },
  { value: 'ADMIN', label: 'ADMIN', badge: 'SYSTEM' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'AUTHORITY',
    department_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'idle' | 'registering' | 'success'>('idle');

  const passwordChecks = useMemo(() => {
    return {
      minLength: form.password.length >= 8,
      hasUpper: /[A-Z]/.test(form.password),
      hasLower: /[a-z]/.test(form.password),
      hasDigit: /\d/.test(form.password),
      hasSpecial: /[^A-Za-z0-9]/.test(form.password),
    };
  }, [form.password]);

  const passwordStrong = Object.values(passwordChecks).every(Boolean);

  const setField = (key: keyof RegisterFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined, general: undefined }));
  };

  const validateForm = (): FormErrors => {
    const next: FormErrors = {};

    if (!form.name.trim()) {
      next.name = 'Full name is required.';
    } else if (form.name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters.';
    } else if (form.name.trim().length > 120) {
      next.name = 'Name must be less than 120 characters.';
    }

    if (!form.email.trim()) {
      next.email = 'Official email is required.';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      next.password = 'Password is required.';
    } else if (!passwordStrong) {
      next.password = 'Password must include uppercase, lowercase, number, symbol, and be 8+ chars.';
    }

    if (!form.confirmPassword) {
      next.confirmPassword = 'Confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Password and confirm password do not match.';
    }

    if (!form.role) {
      next.role = 'Select a role.';
    }

    if (form.department_id.trim() && !OBJECT_ID_REGEX.test(form.department_id.trim())) {
      next.department_id = 'Department ID must be a valid 24-character Mongo ObjectId.';
    }

    return next;
  };

  const mapBackendError = (error: any): FormErrors => {
    const fallback = 'Registration failed. Please review your details and try again.';
    const apiMessage = error?.response?.data?.message as string | undefined;
    const apiErrors = error?.response?.data?.errors;

    if (apiErrors && typeof apiErrors === 'object') {
      return apiErrors as FormErrors;
    }

    if (apiMessage) {
      if (/already exists/i.test(apiMessage)) {
        return { email: apiMessage, general: apiMessage };
      }
      return { general: apiMessage };
    }

    if (!error?.response) {
      return { general: 'Network error. Check connectivity and try again.' };
    }

    return { general: fallback };
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setLoadingStep('registering');
    setErrors({});

    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.department_id.trim() ? { department_id: form.department_id.trim() } : {}),
      });

      setLoadingStep('success');
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            registrationSuccess: true,
            registeredEmail: form.email.trim().toLowerCase(),
          },
        });
      }, 700);
    } catch (error: any) {
      setIsLoading(false);
      setLoadingStep('idle');
      setErrors(mapBackendError(error));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-mono font-bold uppercase text-[10px] text-red-400">REGISTRATION FAILED</div>
            <div className="text-[11px] mt-0.5">{errors.general}</div>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
          <UserRound className="w-3.5 h-3.5 text-cyan-400" />
          FULL NAME
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. Praveen Kumar"
          disabled={isLoading}
          className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#00e3fd] focus:ring-1 focus:ring-[#00e3fd]/50 transition-all"
          required
        />
        {errors.name && <p className="text-[10px] text-red-300 font-mono">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-cyan-400" />
          EMAIL
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="e.g. officer@prahari.gov.in"
          disabled={isLoading}
          className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#00e3fd] focus:ring-1 focus:ring-[#00e3fd]/50 transition-all"
          required
        />
        {errors.email && <p className="text-[10px] text-red-300 font-mono">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          ROLE
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((option) => {
            const selected = form.role === option.value;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => setField('role', option.value)}
                disabled={isLoading}
                className={`p-2.5 rounded-xl text-left border transition-all font-mono ${
                  selected
                    ? 'bg-gradient-to-br from-[#0c1b33] to-[#0a1426] border-[#00e3fd] text-white ring-1 ring-[#00e3fd]/50'
                    : 'bg-[#0a0f1d]/80 border-slate-800 text-slate-300 hover:bg-[#0f172e] hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold tracking-wide">{option.label}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{option.badge}</div>
              </button>
            );
          })}
        </div>
        {errors.role && <p className="text-[10px] text-red-300 font-mono">{errors.role}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          DEPARTMENT ID (OPTIONAL)
        </label>
        <input
          type="text"
          value={form.department_id}
          onChange={(e) => setField('department_id', e.target.value)}
          placeholder="24-character department ObjectId"
          disabled={isLoading}
          className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#00e3fd] focus:ring-1 focus:ring-[#00e3fd]/50 transition-all"
        />
        {errors.department_id && <p className="text-[10px] text-red-300 font-mono">{errors.department_id}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          PASSWORD
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            placeholder="Create secure password"
            disabled={isLoading}
            className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#00e3fd] focus:ring-1 focus:ring-[#00e3fd]/50 transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-400">
          <span className={passwordChecks.minLength ? 'text-emerald-400' : ''}>8+ characters</span>
          <span className={passwordChecks.hasUpper ? 'text-emerald-400' : ''}>Uppercase</span>
          <span className={passwordChecks.hasLower ? 'text-emerald-400' : ''}>Lowercase</span>
          <span className={passwordChecks.hasDigit ? 'text-emerald-400' : ''}>Number</span>
          <span className={passwordChecks.hasSpecial ? 'text-emerald-400' : ''}>Special symbol</span>
        </div>
        {errors.password && <p className="text-[10px] text-red-300 font-mono">{errors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">CONFIRM PASSWORD</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            placeholder="Re-enter password"
            disabled={isLoading}
            className="w-full bg-[#080d1a] border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#00e3fd] focus:ring-1 focus:ring-[#00e3fd]/50 transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
            title={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-[10px] text-red-300 font-mono">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`relative w-full overflow-hidden rounded-xl p-[1px] font-mono font-bold text-xs transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.99] ${
          loadingStep === 'success'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
            : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:shadow-[0_0_25px_rgba(0,227,253,0.4)]'
        }`}
      >
        <div
          className={`w-full py-3 px-4 rounded-[11px] flex items-center justify-center gap-2 transition-all ${
            loadingStep === 'success'
              ? 'bg-emerald-600 text-white font-black'
              : isLoading
              ? 'bg-[#080d1a] text-cyan-300'
              : 'bg-[#090f20] hover:bg-[#0c1630] text-white'
          }`}
        >
          {loadingStep === 'registering' ? (
            <>
              <Cpu className="w-4 h-4 text-[#00e3fd] animate-spin" />
              <span className="tracking-widest text-[#00e3fd]">CREATING SECURE PROFILE...</span>
            </>
          ) : loadingStep === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="tracking-widest">REGISTRATION COMPLETE</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#00e3fd]" />
              <span className="tracking-wider">REGISTER & CONTINUE</span>
              <ArrowRight className="w-4 h-4 text-[#00e3fd]" />
            </>
          )}
        </div>
      </button>

      <div className="pt-2 text-center text-[10px] font-mono text-slate-400">
        Already have credentials?{' '}
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold">
          Return to login
        </Link>
      </div>
    </form>
  );
};
