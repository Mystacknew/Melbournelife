
import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  icon: string;
  color: string;
  showEmoji?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, max, icon, color, showEmoji = true, size = 'md' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const isEnergy = label.includes('පණ') || label.includes('Energy');
  const isStress = label.includes('Stress') || label.includes('කුරුවල්');
  const isHealth = label.includes('Health') || label.includes('සෞඛ්‍ය');
  const isHappiness = label.includes('Happiness') || label.includes('සතුට');
  const isMoney = label.includes('සල්ලි') || label.includes('Money');
  
  const isCritical = isEnergy ? percentage < 25 : 
                     isStress ? percentage > 75 : 
                     isHealth ? percentage < 30 :
                     isHappiness ? percentage < 25 : false;
  
  const isGood = isEnergy ? percentage > 70 :
                 isStress ? percentage < 30 :
                 isHealth ? percentage > 70 :
                 isHappiness ? percentage > 70 : false;
  
  // Determine bar color based on state
  const getBarGradient = () => {
    if (isMoney) return 'from-emerald-500 via-green-400 to-lime-400';
    if (isEnergy) {
      if (isCritical) return 'from-red-600 via-red-500 to-orange-500';
      if (isGood) return 'from-blue-500 via-cyan-400 to-teal-400';
      return 'from-yellow-500 via-amber-400 to-orange-400';
    }
    if (isStress) {
      if (isCritical) return 'from-red-600 via-red-500 to-rose-500';
      if (isGood) return 'from-green-500 via-emerald-400 to-teal-400';
      return 'from-orange-500 via-amber-400 to-yellow-400';
    }
    if (isHealth) {
      if (isCritical) return 'from-red-600 via-red-500 to-rose-500';
      if (isGood) return 'from-pink-500 via-rose-400 to-red-400';
      return 'from-orange-500 via-amber-400 to-yellow-400';
    }
    if (isHappiness) {
      if (isCritical) return 'from-gray-500 via-slate-400 to-zinc-400';
      if (isGood) return 'from-yellow-400 via-amber-300 to-orange-300';
      return 'from-blue-400 via-indigo-400 to-purple-400';
    }
    return 'from-blue-600 via-blue-500 to-cyan-400';
  };

  // Get status emoji
  const getStatusEmoji = () => {
    if (!showEmoji) return null;
    if (isMoney) return value > 5000 ? '💰' : value > 1000 ? '💵' : value < 200 ? '😰' : '💸';
    if (isEnergy) return isCritical ? '😴' : isGood ? '⚡' : '🔋';
    if (isStress) return isCritical ? '🤯' : isGood ? '😌' : '😐';
    if (isHealth) return isCritical ? '🏥' : isGood ? '💪' : '🩺';
    if (isHappiness) return isCritical ? '😢' : isGood ? '😄' : '🙂';
    return null;
  };

  const sizeClasses = {
    sm: { container: 'p-2', bar: 'h-1.5', text: 'text-[9px]', value: 'text-sm', icon: 'text-xs' },
    md: { container: 'p-3', bar: 'h-2.5', text: 'text-[10px]', value: 'text-lg', icon: 'text-sm' },
    lg: { container: 'p-4', bar: 'h-3.5', text: 'text-xs', value: 'text-2xl', icon: 'text-base' }
  };
  
  const s = sizeClasses[size];

  return (
    <div className={`relative ${s.container} rounded-2xl transition-all duration-300 ${
      isCritical ? 'bg-gradient-to-br from-red-950/80 to-red-900/60 border-2 border-red-500/40 animate-pulse shadow-lg shadow-red-500/20' : 
      isGood ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/70 border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10' :
      'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-white/10 hover:border-white/20'
    }`}>
      {/* Glow effect for critical/good states */}
      {(isCritical || isGood) && (
        <div className={`absolute inset-0 rounded-2xl opacity-20 blur-md ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
      )}
      
      <div className="relative z-10">
        {/* Header with icon and label */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isCritical ? 'bg-red-500/30 text-red-400' : 
              isGood ? 'bg-emerald-500/30 text-emerald-400' :
              'bg-slate-700/50'
            } ${color}`}>
              <i className={`${icon} ${s.icon}`}></i>
            </div>
            <span className={`${s.text} uppercase font-black tracking-widest sinhala ${
              isCritical ? 'text-red-400' : 'text-slate-400'
            }`}>
              {label}
            </span>
          </div>
          {showEmoji && (
            <span className="text-lg animate-bounce" style={{ animationDuration: '2s' }}>
              {getStatusEmoji()}
            </span>
          )}
        </div>
        
        {/* Value display */}
        <div className="flex items-end justify-between mb-2">
          <span className={`${s.value} font-black ${
            isCritical ? 'text-red-400' : isGood ? 'text-emerald-400' : 'text-white'
          }`}>
            {isMoney ? `$${Math.round(value).toLocaleString()}` : Math.round(value)}
          </span>
          {!isMoney && (
            <span className={`${s.text} text-slate-500 font-bold`}>/ {max}</span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className={`${s.bar} w-full bg-slate-900/80 rounded-full overflow-hidden border ${
          isCritical ? 'border-red-500/50' : 'border-slate-700/50'
        } shadow-inner`}>
          <div 
            className={`h-full transition-all duration-700 ease-out bg-gradient-to-r ${getBarGradient()} relative`}
            style={{ width: `${percentage}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        {/* Warning messages */}
        {isEnergy && isCritical && (
          <div className="mt-2 flex items-center gap-1 text-red-400">
            <i className="fa-solid fa-triangle-exclamation text-xs animate-pulse"></i>
            <span className="text-[10px] font-black sinhala">පණ නෑ මචං! Rest needed!</span>
          </div>
        )}
        {isStress && isCritical && (
          <div className="mt-2 flex items-center gap-1 text-orange-400">
            <i className="fa-solid fa-brain text-xs animate-pulse"></i>
            <span className="text-[10px] font-black sinhala">මොලේ කුරුවල්! Take a break!</span>
          </div>
        )}
        {isHealth && isCritical && (
          <div className="mt-2 flex items-center gap-1 text-red-400">
            <i className="fa-solid fa-heart-crack text-xs animate-pulse"></i>
            <span className="text-[10px] font-black">Health critical! See a doctor!</span>
          </div>
        )}
        {isHappiness && isCritical && (
          <div className="mt-2 flex items-center gap-1 text-blue-400">
            <i className="fa-solid fa-face-sad-tear text-xs animate-pulse"></i>
            <span className="text-[10px] font-black sinhala">දුක වැඩියි! Need fun activities!</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact stat display for headers
export const CompactStat: React.FC<{
  label: string;
  value: number | string;
  icon: string;
  color: string;
  isCritical?: boolean;
}> = ({ label, value, icon, color, isCritical }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
    isCritical ? 'bg-red-500/20 border border-red-500/40 animate-pulse' : 'bg-slate-800/50 border border-white/5'
  }`}>
    <i className={`${icon} ${isCritical ? 'text-red-400' : color}`}></i>
    <div className="flex flex-col">
      <span className="text-[8px] text-slate-500 uppercase font-black leading-none">{label}</span>
      <span className={`text-sm font-black leading-none ${isCritical ? 'text-red-400' : 'text-white'}`}>{value}</span>
    </div>
  </div>
);
