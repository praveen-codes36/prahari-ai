import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trendText?: string;
  isPositiveTrend?: boolean;
  icon: LucideIcon;
  accentColor?: 'primary' | 'error' | 'secondary' | 'amber';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trendText,
  isPositiveTrend = true,
  icon: Icon,
  accentColor = 'primary',
  onClick,
  className = '',
}) => {
  const colorConfigs = {
    primary: {
      iconBg: 'bg-[#b3c5ff]/10 text-[#b3c5ff]',
      blob: 'bg-[#0066ff]/10',
      valueColor: 'text-[#dde2f8]',
    },
    error: {
      iconBg: 'bg-[#ffb4ab]/15 text-[#ffb4ab]',
      blob: 'bg-[#93000a]/20',
      valueColor: 'text-[#ffb4ab] drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]',
    },
    secondary: {
      iconBg: 'bg-[#00e3fd]/10 text-[#00daf3]',
      blob: 'bg-[#00e3fd]/10',
      valueColor: 'text-[#dde2f8]',
    },
    amber: {
      iconBg: 'bg-[#ffa000]/15 text-[#ffa000]',
      blob: 'bg-[#ffa000]/15',
      valueColor: 'text-[#ffa000]',
    },
  };

  const config = colorConfigs[accentColor] || colorConfigs.primary;

  return (
    <div
      onClick={onClick}
      className={`relative bg-[#191f2f]/80 backdrop-blur-xl p-5 md:p-6 rounded-xl border border-white/5 shadow-lg overflow-hidden group transition-all duration-200 hover:border-white/10 ${
        onClick ? 'cursor-pointer hover:bg-[#242a3a]/80' : ''
      } ${className}`}
    >
      {/* Background blur blob */}
      <div
        className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl transition-all duration-300 group-hover:scale-125 ${config.blob}`}
      />

      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className={`p-1.5 rounded-lg ${config.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-mono text-[11px] text-[#8c90a1] uppercase tracking-wider">
          {title}
        </span>
      </div>

      <div className={`text-3xl md:text-4xl font-bold tracking-tight mb-2 relative z-10 ${config.valueColor}`}>
        {value}
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-[#8c90a1] relative z-10">
        {trendText && (
          <span
            className={`flex items-center gap-1 font-semibold ${
              isPositiveTrend ? 'text-[#00daf3]' : 'text-[#ffb4ab]'
            }`}
          >
            {trendText}
          </span>
        )}
        {subtext && <span className="text-[#8c90a1]">{subtext}</span>}
      </div>
    </div>
  );
};
