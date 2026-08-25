import React from 'react';

interface AIConfidenceRingProps {
  score: number; // 0 - 100
  size?: number; // e.g. 48
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export const AIConfidenceRing: React.FC<AIConfidenceRingProps> = ({
  score,
  size = 48,
  strokeWidth = 3,
  showLabel = true,
  className = '',
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2f3445"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#00e3fd"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,227,253,0.8)]"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[11px] font-bold text-[#00e3fd] leading-none">
            {score}%
          </span>
        </div>
      )}
    </div>
  );
};
