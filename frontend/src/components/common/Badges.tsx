import React from 'react';
import { SeverityLevel, ReportStatus } from '../../types';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5 tracking-wider',
    lg: 'text-xs px-2.5 py-1 tracking-widest font-bold',
  };

  switch (severity) {
    case 'critical':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-[#93000a] text-[#ffdad6] border border-[#ffb4ab]/30 shadow-[0_0_8px_rgba(255,180,171,0.3)] ${sizeClasses[size]} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse"></span>
          Critical
        </span>
      );
    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-[#ffa000]/20 text-[#ffa000] border border-[#ffa000]/40 shadow-[0_0_8px_rgba(255,160,0,0.25)] ${sizeClasses[size]} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffa000]"></span>
          High
        </span>
      );
    case 'medium':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-[#00e3fd]/15 text-[#00daf3] border border-[#00e3fd]/30 ${sizeClasses[size]} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3]"></span>
          Medium
        </span>
      );
    case 'low':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase font-bold rounded bg-[#0066ff]/20 text-[#b3c5ff] border border-[#b3c5ff]/30 ${sizeClasses[size]} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#b3c5ff]"></span>
          Low
        </span>
      );
  }
};

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const configs: Record<ReportStatus, { label: string; bg: string; text: string; border: string }> = {
    submitted: { label: 'Reported', bg: 'bg-[#191f2f]', text: 'text-[#c2c6d8]', border: 'border-[#424656]' },
    under_review: { label: 'Under Review', bg: 'bg-[#ffa000]/15', text: 'text-[#ffa000]', border: 'border-[#ffa000]/30' },
    verified: { label: 'AI Verified', bg: 'bg-[#00e3fd]/15', text: 'text-[#00daf3]', border: 'border-[#00e3fd]/30' },
    assigned: { label: 'Assigned', bg: 'bg-[#0066ff]/20', text: 'text-[#b3c5ff]', border: 'border-[#0066ff]/40' },
    in_progress: { label: 'In Progress (WIP)', bg: 'bg-[#00e3fd]/20', text: 'text-[#00daf3]', border: 'border-[#00daf3]/50' },
    resolved: { label: 'Resolved & Closed', bg: 'bg-emerald-950/50', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  };

  const config = configs[status] || configs.submitted;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wide border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'in_progress' ? 'bg-[#00daf3] animate-pulse' : 'bg-current'}`}></span>
      {config.label}
    </span>
  );
};
