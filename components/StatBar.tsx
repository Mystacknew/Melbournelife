
import React, { useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);
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

  // Get status emoji with more variety
  const getStatusEmoji = () => {
    if (!showEmoji) return null;
    if (isMoney) return value > 5000 ? '💰' : value > 1000 ? '💵' : value < 200 ? '😰' : '💸';
    if (isEnergy) return isCritical ? '😴' : isGood ? '⚡' : '🔋';
    if (isStress) return isCritical ? '🤯' : isGood ? '😌' : '😐';
    if (isHealth) return isCritical ? '🏥' : isGood ? '💪' : '🩺';
    if (isHappiness) return isCritical ? '😢' : isGood ? '😄' : '🙂';
    return null;
  };

  // Get tooltip text
  const getTooltipText = () => {
    if (isMoney) return `${value > 5000 ? 'Great savings!' : value > 1000 ? 'Manageable funds' : 'Low on cash - find work!'}`;
    if (isEnergy) return `${isCritical ? 'Critical! Rest immediately!' : isGood ? 'Full of energy!' : 'Moderate energy levels'}`;
    if (isStress) return `${isCritical ? 'Danger! Take a break!' : isGood ? 'Calm and relaxed' : 'Some stress, manageable'}`;
    if (isHealth) return `${isCritical ? 'See a doctor ASAP!' : isGood ? 'Healthy and strong!' : 'Health is okay'}`;
    if (isHappiness) return `${isCritical ? 'Very unhappy - do something fun!' : isGood ? 'Living the dream!' : 'Content but could be better'}`;
    return '';
  };

  const sizeClasses = {
    sm: { container: 'p-2', bar: 'h-1.5', text: 'text-[9px]', value: 'text-sm', icon: 'text-xs', iconBox: 'w-6 h-6' },
    md: { container: 'p-3', bar: 'h-2.5', text: 'text-[10px]', value: 'text-lg', icon: 'text-sm', iconBox: 'w-8 h-8' },
    lg: { container: 'p-4', bar: 'h-3.5', text: 'text-xs', value: 'text-2xl', icon: 'text-base', iconBox: 'w-10 h-10' }
  };
  
  const s = sizeClasses[size];

  return (
    <div 
      className={`relative ${s.container} rounded-2xl transition-all duration-500 cursor-default group ${
        isCritical 
          ? 'bg-gradient-to-br from-red-950/80 to-red-900/60 border-2 border-red-500/40 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30' 
          : isGood 
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/70 border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20' 
            : 'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10 shadow-md shadow-black/20'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect for critical/good states */}
      {(isCritical || isGood) && (
        <div className={`absolute inset-0 rounded-2xl opacity-20 blur-md transition-opacity duration-300 ${
          isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
        }`}></div>
      )}

      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 blur-md transition-opacity duration-300 bg-blue-500`}></div>
      
      {/* Tooltip on hover */}
      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-xl text-xs text-white font-medium whitespace-nowrap z-50 shadow-xl shadow-black/50 transition-all duration-200 ${
        isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
      }`} style={{ animation: isHovered ? 'tooltip-appear 0.2s ease-out forwards' : 'none' }}>
        {getTooltipText()}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header with icon and label */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className={`${s.iconBox} rounded-xl flex items-center justify-center transition-all duration-300 ${
              isCritical 
                ? 'bg-red-500/30 text-red-400 animate-pulse' 
                : isGood 
                  ? 'bg-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/50'
            } ${color}`}>
              <i className={`${icon} ${s.icon} transition-transform duration-300 group-hover:scale-110`}></i>
            </div>
            <span className={`${s.text} uppercase font-black tracking-widest sinhala transition-colors duration-300 ${
              isCritical ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-300'
            }`}>
              {label}
            </span>
          </div>
          {showEmoji && (
            <span className={`text-lg transition-transform duration-300 ${
              isCritical ? 'animate-bounce' : 'group-hover:scale-125 group-hover:-rotate-12'
            }`} style={{ animationDuration: '1s' }}>
              {getStatusEmoji()}
            </span>
          )}
        </div>
        
        {/* Value display */}
        <div className="flex items-end justify-between mb-2">
          <span className={`${s.value} font-black transition-all duration-500 ${
            isCritical ? 'text-red-400' : isGood ? 'text-emerald-400' : 'text-white'
          }`}>
            {isMoney ? `$${Math.round(value).toLocaleString()}` : Math.round(value)}
          </span>
          {!isMoney && (
            <span className={`${s.text} text-slate-500 font-bold transition-colors duration-300 group-hover:text-slate-400`}>/ {max}</span>
          )}
        </div>
        
        {/* Progress bar container */}
        <div className={`${s.bar} w-full bg-slate-900/80 rounded-full overflow-hidden border transition-all duration-300 shadow-inner ${
          isCritical ? 'border-red-500/50 shadow-red-500/20' : 'border-slate-700/50 group-hover:border-slate-600/50 shadow-black/30'
        }`}>
          {/* Progress bar fill */}
          <div 
            className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${getBarGradient()} relative ${
              isCritical ? 'animate-pulse' : ''
            } shadow-lg`}
            style={{ 
              width: `${percentage}%`,
              boxShadow: isCritical ? '0 0 10px rgba(239, 68, 68, 0.5)' : '0 0 10px rgba(59, 130, 246, 0.3)'
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            
            {/* Right edge glow */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-white/40 blur-sm"></div>
          </div>
        </div>
        
        {/* Warning messages with enhanced animation */}
        {isEnergy && isCritical && (
          <div className="mt-2 flex items-center gap-1 text-red-400 animate-fade-in-up">
            <i className="fa-solid fa-triangle-exclamation text-xs animate-pulse"></i>
            <span className="text-[10px] font-black sinhala">පණ නෑ මචං! Rest needed!</span>
          </div>
        )}
        {isStress && isCritical && (
          <div className="mt-2 flex items-center gap-1 text-orange-400 animate-fade-in-up">
            <i className="fa-solid fa-brain text-xs animate-pulse"></i>
            <span className="text-[10px] font-black sinhala">මොලේ කුරුවල්! Take a break!</span>
          </div>
        )}
        {isHealth && isCritical && (
          <div className="mt-2 flex items-center gap-1 text-red-400 animate-fade-in-up">
            <i className="fa-solid fa-heart-crack text-xs animate-pulse"></i>
            <span className="text-[10px] font-black">Health critical! See a doctor!</span>
          </div>
        )}
        {isHappiness && isCritical && (
          <div className="mt-2 flex items-center gap-1 text-blue-400 animate-fade-in-up">
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
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group cursor-default ${
    isCritical 
      ? 'bg-red-500/20 border border-red-500/40 animate-pulse shadow-lg shadow-red-500/10' 
      : 'bg-slate-800/50 border border-white/5 hover:bg-slate-700/50 hover:border-white/10 hover:shadow-lg hover:shadow-blue-500/5'
  }`}>
    <i className={`${icon} ${isCritical ? 'text-red-400' : color} transition-transform duration-300 group-hover:scale-110`}></i>
    <div className="flex flex-col">
      <span className="text-[8px] text-slate-500 uppercase font-black leading-none transition-colors duration-300 group-hover:text-slate-400">{label}</span>
      <span className={`text-sm font-black leading-none transition-colors duration-300 ${isCritical ? 'text-red-400' : 'text-white'}`}>{value}</span>
    </div>
  </div>
);
