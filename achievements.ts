import { Achievement, GameStats, GameState } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  // Money Achievements
  {
    id: 'first-paycheck',
    title: '💰 First Paycheck!',
    description: 'Earned your first $1000 in Australia',
    icon: '💵',
    color: 'green',
    maxProgress: 1000
  },
  {
    id: 'budget-king',
    title: '👑 Budget King',
    description: 'Saved $5000 while studying',
    icon: '🏦',
    color: 'gold',
    maxProgress: 5000
  },
  {
    id: 'money-bags',
    title: '💰 Money Bags',
    description: 'Accumulated $10,000',
    icon: '💰',
    color: 'yellow',
    maxProgress: 10000
  },
  
  // Survival Achievements
  {
    id: 'first-week',
    title: '📅 First Week Survivor',
    description: 'Survived your first 7 days in Melbourne',
    icon: '🗓️',
    color: 'blue',
    maxProgress: 7
  },
  {
    id: 'one-month',
    title: '🎯 One Month Strong',
    description: 'Made it through 30 days!',
    icon: '📆',
    color: 'purple',
    maxProgress: 30
  },
  {
    id: 'settlement-ready',
    title: '🏡 Settlement Ready',
    description: 'Reached day 90 - PR pathway unlocked!',
    icon: '🇦🇺',
    color: 'green',
    maxProgress: 90
  },
  
  // Health & Wellness
  {
    id: 'zen-master',
    title: '🧘 Zen Master',
    description: 'Kept stress below 30 for 7 consecutive days',
    icon: '☮️',
    color: 'purple'
  },
  {
    id: 'gym-rat',
    title: '💪 Gym Rat',
    description: 'Maintained health above 80 for 14 days',
    icon: '🏋️',
    color: 'red'
  },
  {
    id: 'workaholic',
    title: '⚡ Workaholic',
    description: 'Worked 10 consecutive days',
    icon: '⚡',
    color: 'orange',
    maxProgress: 10
  },
  
  // Social Achievements
  {
    id: 'social-butterfly',
    title: '🦋 Social Butterfly',
    description: 'Made 5+ friends in Melbourne',
    icon: '👥',
    color: 'blue',
    maxProgress: 5
  },
  {
    id: 'sri-lankan-connection',
    title: '🇱🇰 Sri Lankan Connection',
    description: 'Attended 3 Sri Lankan community events',
    icon: '🎭',
    color: 'orange',
    maxProgress: 3
  },
  
  // Academic
  {
    id: 'library-lover',
    title: '📚 Library Lover',
    description: 'Visited library 10 times',
    icon: '📖',
    color: 'blue',
    maxProgress: 10
  },
  {
    id: 'straight-a',
    title: '🎓 Straight A Student',
    description: 'Maintained excellent grades while working',
    icon: '⭐',
    color: 'yellow'
  },
  
  // Work Achievements
  {
    id: 'job-hopper',
    title: '🔄 Job Hopper',
    description: 'Worked at 3 different jobs',
    icon: '💼',
    color: 'blue',
    maxProgress: 3
  },
  {
    id: 'employee-of-month',
    title: '🌟 Employee of the Month',
    description: 'Got promoted or received a bonus',
    icon: '🏆',
    color: 'gold'
  },
  
  // Transport
  {
    id: 'myki-master',
    title: '🚇 Myki Master',
    description: 'Used Melbourne transport 20 times',
    icon: '🎫',
    color: 'green',
    maxProgress: 20
  },
  {
    id: 'bicycle-champion',
    title: '🚴 Bicycle Champion',
    description: 'Cycled everywhere for 14 days',
    icon: '🚲',
    color: 'green',
    maxProgress: 14
  },
  
  // Special Achievements
  {
    id: 'crisis-manager',
    title: '🔥 Crisis Manager',
    description: 'Survived with less than $100 for 7 days',
    icon: '💥',
    color: 'red'
  },
  {
    id: 'perfect-balance',
    title: '⚖️ Perfect Balance',
    description: 'Maintained all stats above 50 for 7 days',
    icon: '✨',
    color: 'purple'
  },
  {
    id: 'lucky-streak',
    title: '🍀 Lucky Streak',
    description: 'Triggered 5 positive random events',
    icon: '🎲',
    color: 'green',
    maxProgress: 5,
    hidden: true
  }
];

// Check which achievements should be unlocked
export function checkAchievements(
  gameState: GameState,
  previousStats?: GameStats
): Achievement[] {
  const newAchievements: Achievement[] = [];
  const unlockedIds = gameState.achievements || [];
  
  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (unlockedIds.includes(achievement.id)) return;
    
    const stats = gameState.stats;
    
    // Check each achievement condition
    switch (achievement.id) {
      case 'first-paycheck':
        if (stats.money >= 1000) newAchievements.push(achievement);
        break;
      
      case 'budget-king':
        if (stats.money >= 5000) newAchievements.push(achievement);
        break;
      
      case 'money-bags':
        if (stats.money >= 10000) newAchievements.push(achievement);
        break;
      
      case 'first-week':
        if (stats.day >= 7) newAchievements.push(achievement);
        break;
      
      case 'one-month':
        if (stats.day >= 30) newAchievements.push(achievement);
        break;
      
      case 'settlement-ready':
        if (stats.day >= 90) newAchievements.push(achievement);
        break;
      
      case 'workaholic':
        if (stats.consecutiveWorkDays >= 10) newAchievements.push(achievement);
        break;
      
      // Add more achievement checks as needed
    }
  });
  
  return newAchievements;
}

// Get achievement progress for UI
export function getAchievementProgress(achievement: Achievement, stats: GameStats): number {
  if (!achievement.maxProgress) return 0;
  
  switch (achievement.id) {
    case 'first-paycheck':
    case 'budget-king':
    case 'money-bags':
      return Math.min((stats.money / achievement.maxProgress) * 100, 100);
    
    case 'first-week':
    case 'one-month':
    case 'settlement-ready':
      return Math.min((stats.day / achievement.maxProgress) * 100, 100);
    
    case 'workaholic':
      return Math.min((stats.consecutiveWorkDays / achievement.maxProgress) * 100, 100);
    
    default:
      return 0;
  }
}
