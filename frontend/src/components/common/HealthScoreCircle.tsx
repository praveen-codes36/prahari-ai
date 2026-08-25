import React from 'react';

interface HealthScoreCircleProps {
  score: number; // 0 - 100 (lower = critical road damage)
  size?: number; // e.g. 48
  strokeWidth?: number;
  className?: string;
}

export const HealthScoreCircle: React.FC<HealthScoreCircleProps> = ({
  score,
  size = 48,
  strokeWidth = 3.5,
  className = '',
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#00e3fd'; // healthy cyan
  let shadowClass = 'drop-shadow-[0_0_6px_rgba(0,227,253,0.7)]';

  if (score < 40) {
    strokeColor = '#ffb4ab'; // critical red
    shadowClass = 'drop-shadow-[0_0_8px_rgba(255,180,171,0.8)]';
  } else if (score < 70) {
    strokeColor = '#ffa000'; // amber
    shadowClass = 'drop-shadow-[0_0_6px_rgba(255,160,0,0.7)]';
  }

  return (
    <div
      className={`relative flex items-center justify-center bg-[#0d1322] rounded-lg shadow-inner ${className}`}
      style={{ width: size, height: size }}
    >
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
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out ${shadowClass}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[11px] font-bold text-[#dde2f8] leading-none">
          {score}
        </span>
      </div>
    </div>
  );
};
