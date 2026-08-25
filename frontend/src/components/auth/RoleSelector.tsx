import React from 'react';
import { ShieldCheck, Zap, Wrench, User, CheckCircle2, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';
import { ROLE_PRESETS } from '../../services/authService';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  const roles: { role: UserRole; icon: React.ReactNode; label: string; sub: string; badge: string }[] = [
    {
      role: 'authority',
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
      label: 'AUTHORITY',
      sub: 'Infrastructure HQ',
      badge: 'PWD / NHAI',
    },
    {
      role: 'emergency',
      icon: <Zap className="w-4 h-4 text-red-400" />,
      label: 'EMERGENCY OPS',
      sub: 'Response Command',
      badge: 'EMS 108',
    },
    {
      role: 'maintenance',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      label: 'FIELD TEAM',
      sub: 'Maintenance Ops',
      badge: 'Crew Lead',
    },
    {
      role: 'citizen',
      icon: <User className="w-4 h-4 text-emerald-400" />,
      label: 'CITIZEN',
      sub: 'Public Access',
      badge: 'Sentinel',
    },
  ];

  const currentPreset = ROLE_PRESETS[selectedRole];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono font-bold tracking-widest text-slate-300 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#00e3fd]" />
          OPERATIONAL ROLE ACCESS
        </label>
        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          {currentPreset.badge}
        </span>
      </div>

      {/* 2x2 Segmented Premium Role Grid */}
      <div className="grid grid-cols-2 gap-2">
        {roles.map((item) => {
          const isSelected = selectedRole === item.role;
          return (
            <button
              key={item.role}
              type="button"
              onClick={() => onSelectRole(item.role)}
              className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all duration-200 cursor-pointer select-none group border flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0c1b33] to-[#0a1426] border-[#00e3fd] shadow-[0_0_15px_rgba(0,227,253,0.25)] ring-1 ring-[#00e3fd]/50'
                  : 'bg-[#0a0f1d]/80 hover:bg-[#0f172e] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#00e3fd]/20 text-[#00e3fd]' : 'bg-slate-800/80 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-xs font-mono font-bold tracking-wide transition-colors ${
                      isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00e3fd]" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-slate-700" />
                )}
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className={isSelected ? 'text-cyan-200' : 'text-slate-400'}>
                  {item.sub}
                </span>
                <span className="text-[9px] font-mono text-slate-400 opacity-80">
                  {item.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Role Scope Pill */}
      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span className="text-slate-300 truncate mr-2">
          Scope: <strong className="text-cyan-400 font-normal">{currentPreset.clearanceLabel}</strong>
        </span>
        <span className="text-[9px] text-[#00e3fd] shrink-0 font-bold uppercase">
          ROUTE: {currentPreset.targetRoute}
        </span>
      </div>
    </div>
  );
};
