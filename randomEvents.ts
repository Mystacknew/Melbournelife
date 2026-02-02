import { RandomEvent, GameStats } from './types';

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'unexpected-phone-bill',
    trigger: { minDay: 10, maxDay: 30, chance: 0.15 },
    title: '📱 Phone Bill Surprise!',
    description: 'Your phone bill is higher than expected due to international calls home. මව්ට කතා කරන්න පුලුවන් නැතුව ඉන්න බැහැ නේද? 😅',
    image: '/images/story/finance/01-budget-planning.jpg',
    choices: [
      {
        text: 'Pay the full amount (-$150)',
        consequences: { money: -150, stress: 5, happiness: 5 }
      },
      {
        text: 'Switch to a cheaper plan (-$50, මොනවද කියන්නේ)',
        consequences: { money: -50, stress: 10, happiness: -5 }
      },
      {
        text: 'Use WhatsApp instead (Free, but need wifi)',
        consequences: { stress: 5, happiness: 0 }
      }
    ]
  },
  {
    id: 'lucky-find',
    trigger: { minDay: 5, chance: 0.08 },
    title: '🎉 Lucky Day Machang!',
    description: 'You found a $50 note on the street while walking to the tram stop! Melbourne වල හොඳ දේවල් වෙනවා! 🍀',
    image: '/images/story/social/03-park-walk.jpg',
    autoResolve: { money: 50, happiness: 15, stress: -5 }
  },
  {
    id: 'homesickness',
    trigger: { minDay: 20, minStress: 50, chance: 0.25 },
    title: '🏠 Missing Home',
    description: 'Feeling really homesick tonight. You miss amma\'s කෑම, your friends, and even the traffic jams. What will help?',
    image: '/images/story/social/01-friends-park.jpg',
    choices: [
      {
        text: 'Video call family (1 hour, -$10 data)',
        consequences: { money: -10, stress: -25, happiness: 20 }
      },
      {
        text: 'Go out with Sri Lankan friends (-$30)',
        consequences: { money: -30, stress: -15, happiness: 15 }
      },
      {
        text: 'Just sleep it off (Free)',
        consequences: { energy: -10, stress: 5 }
      }
    ]
  },
  {
    id: 'job-bonus',
    trigger: { minDay: 45, minMoney: 1000, chance: 0.10 },
    title: '💼 Performance Bonus!',
    description: 'Your manager noticed your hard work and dedication! Extra $200 bonus this week! සුපිරි වැඩක්! 🎊',
    image: '/images/story/work/04-team-meeting.jpg',
    autoResolve: { money: 200, happiness: 25, stress: -10 }
  },
  {
    id: 'free-meal',
    trigger: { minDay: 15, chance: 0.12 },
    title: '🍛 Free Meal at Temple',
    description: 'Buddhist temple is having a free meal event. Sri Lankan කෑම! හරිම රස! Save money and reduce stress.',
    image: '/images/story/student/04-cafeteria.jpg',
    autoResolve: { money: 15, happiness: 10, stress: -10 }
  },
  {
    id: 'transport-fine',
    trigger: { minDay: 8, maxMoney: 500, chance: 0.10 },
    title: '🚇 Myki Card Fine!',
    description: 'Forgot to tap on! Metro inspector caught you. $250 fine! මොකෝ මේක! 😫',
    image: '/images/story/transport/01-tram-ride.jpg',
    autoResolve: { money: -250, stress: 20, happiness: -15 }
  },
  {
    id: 'job-opportunity',
    trigger: { minDay: 30, chance: 0.12 },
    title: '💰 Better Job Offer!',
    description: 'A friend referred you to a better-paying job! $25/hour instead of your current rate!',
    image: '/images/story/career/04-networking-event.jpg',
    choices: [
      {
        text: 'Take the new job (+$5/hour)',
        consequences: { happiness: 20, stress: 10 }
      },
      {
        text: 'Stay loyal to current employer',
        consequences: { stress: -5, happiness: 5 }
      }
    ]
  },
  {
    id: 'health-checkup',
    trigger: { minDay: 40, chance: 0.08 },
    title: '🏥 Free Health Checkup',
    description: 'University offering free health screening for international students!',
    image: '/images/story/health/01-gym-fitness.jpg',
    autoResolve: { health: 15, stress: -5, happiness: 10 }
  },
  {
    id: 'cricket-match',
    trigger: { minDay: 25, chance: 0.15 },
    title: '🏏 Sri Lanka vs Australia Match!',
    description: 'Big cricket match at MCG! Your friends are going. $80 for ticket. අපි ජය ගමු! 🇱🇰',
    image: '/images/story/social/02-sports-cricket.jpg',
    choices: [
      {
        text: 'Go to MCG! (-$80)',
        consequences: { money: -80, stress: -20, happiness: 30 }
      },
      {
        text: 'Watch at Sri Lankan sports bar (-$20)',
        consequences: { money: -20, stress: -10, happiness: 15 }
      },
      {
        text: 'Watch free stream at home',
        consequences: { happiness: 5 }
      }
    ]
  },
  {
    id: 'bike-stolen',
    trigger: { minDay: 35, chance: 0.06 },
    title: '🚲 Bicycle Stolen!',
    description: 'Your bicycle was stolen from outside the library! කොල්ලකාරයෝ! Now you need transport.',
    image: '/images/story/transport/02-bicycle-ride.jpg',
    choices: [
      {
        text: 'Buy new bike (-$200)',
        consequences: { money: -200, stress: 15, newItem: 'Bicycle' }
      },
      {
        text: 'Use Myki card only (-$40/week)',
        consequences: { money: -40, stress: 10 }
      }
    ]
  },
  {
    id: 'cultural-festival',
    trigger: { minDay: 50, chance: 0.10 },
    title: '🎭 Sinhala New Year Festival',
    description: 'Sri Lankan community celebrating අලුත් අවුරුද්ද in Melbourne! Free food, games, and කිරිබත්!',
    image: '/images/story/social/01-friends-park.jpg',
    autoResolve: { happiness: 25, stress: -15, energy: 10 }
  },
  {
    id: 'expensive-textbook',
    trigger: { minDay: 10, maxDay: 20, chance: 0.15 },
    title: '📚 Expensive Textbook',
    description: 'Need to buy textbook for next semester. $150! Or find alternatives?',
    image: '/images/story/student/03-library.jpg',
    choices: [
      {
        text: 'Buy new textbook (-$150)',
        consequences: { money: -150, stress: -5 }
      },
      {
        text: 'Buy used copy (-$70)',
        consequences: { money: -70, stress: 0 }
      },
      {
        text: 'Library reserve (Free but stressful)',
        consequences: { stress: 10 }
      }
    ]
  }
];

// Check if random event should trigger
export function checkForRandomEvent(
  stats: GameStats,
  triggeredEvents: string[] = []
): RandomEvent | null {
  const eligibleEvents = RANDOM_EVENTS.filter(event => {
    // Already triggered
    if (triggeredEvents.includes(event.id)) return false;
    
    // Check day requirements
    if (event.trigger.minDay && stats.day < event.trigger.minDay) return false;
    if (event.trigger.maxDay && stats.day > event.trigger.maxDay) return false;
    
    // Check money requirements
    if (event.trigger.minMoney && stats.money < event.trigger.minMoney) return false;
    if (event.trigger.maxMoney && stats.money > event.trigger.maxMoney) return false;
    
    // Check stress requirements
    if (event.trigger.minStress && stats.stress < event.trigger.minStress) return false;
    if (event.trigger.maxStress && stats.stress > event.trigger.maxStress) return false;
    
    // Check happiness requirements
    if (event.trigger.minHappiness && (stats.happiness || 50) < event.trigger.minHappiness) return false;
    
    // Random chance
    return Math.random() < event.trigger.chance;
  });
  
  return eligibleEvents.length > 0 ? eligibleEvents[0] : null;
}
