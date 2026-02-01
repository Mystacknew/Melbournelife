
import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  icon: string;
  color: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, max, icon, color }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const isEnergy = label.includes('පණ') || label.includes('Energy');
  const isStress = label.includes('Stress') || label.includes('කුරුවල්');
  
  const isCritical = isEnergy ? percentage < 25 : isStress ? percentage > 75 : false;
  
  // Determine bar color based on critical state
  let barGradient = '';
  if (isEnergy && isCritical) {
    barGradient = 'from-red-600 to-red-400';
  } else {
    barGradient = color === 'text-green-400' ? 'from-green-600 to-green-400' : 
                  color === 'text-red-400' ? 'from-red-600 to-red-400' : 
                  'from-blue-600 to-blue-400';
  }

  return (
    <div className={`flex flex-col gap-1 w-full transition-all duration-300 ${isCritical ? 'animate-pulse' : ''}`}>
      <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-wider opacity-80">
        <span className="flex items-center gap-1.5 truncate">
          <i className={`${icon} ${isEnergy && isCritical ? 'text-red-400' : color}`}></i> 
          <span className={`sinhala ${isEnergy && isCritical ? 'text-red-400' : ''}`}>{label}</span>
        </span>
        <span className={isCritical ? 'text-white font-bold' : ''}>
          {Math.round(value)}{label.includes('සල්ලි') ? '$' : ''}
        </span>
      </div>
      <div className={`h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border transition-colors duration-300 ${isEnergy && isCritical ? 'border-red-500/50' : 'border-slate-700/50'}`}>
        <div 
          className={`h-full transition-all duration-700 ease-out bg-gradient-to-r ${barGradient}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isEnergy && isCritical && (
        <span className="text-[9px] text-red-500 font-black sinhala text-right drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
          පණ නෑ මචං!
        </span>
      )}
      {isStress && isCritical && (
        <span className="text-[9px] text-orange-500 font-black sinhala text-right">
          මොලේ කුරුවල්!
        </span>
      )}
    </div>
  );
};
