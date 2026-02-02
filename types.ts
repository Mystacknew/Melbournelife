
export type ProfileClass = "ඇමති පුතා" | "Business Family" | "Middle Class" | "Lower Class";
export type Gender = "Male" | "Female";
export type RelationshipStatus = "Single" | "Couple" | "With Kids";
export type StoryMode = "predefined" | "ai-creative";

export interface CharacterProfile {
  name: string;
  age: number;
  gender: Gender;
  status: RelationshipStatus;
  class: ProfileClass;
}

export interface GameSettings {
  storyMode: StoryMode;
  geminiApiKey?: string; // Only needed for AI creative mode
}

export interface GameStats {
  money: number;
  stress: number;
  energy: number;
  day: number;
  health: number;
  visaDaysLeft: number;
  weeklyRent: number;
  lastRentDay: number;
  consecutiveWorkDays: number;
  happiness?: number; // New stat for achievements
}

// Random Events
export interface RandomEvent {
  id: string;
  trigger: {
    minDay?: number;
    maxDay?: number;
    chance: number;
    minMoney?: number;
    maxMoney?: number;
    minStress?: number;
    maxStress?: number;
    minHappiness?: number;
  };
  title: string;
  description: string;
  image: string;
  autoResolve?: {
    money?: number;
    stress?: number;
    energy?: number;
    health?: number;
    happiness?: number;
  };
  choices?: {
    text: string;
    consequences: {
      money?: number;
      stress?: number;
      energy?: number;
      health?: number;
      happiness?: number;
      newItem?: string;
    };
  }[];
}

// Achievements
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: number; // day number
  progress?: number;
  maxProgress?: number;
  hidden?: boolean;
}

// Story Branches
export interface StoryBranch {
  unlockedBy?: string; // Choice ID that unlocks this
  lockedBy?: string; // Choice ID that locks this
}

export interface Choice {
  id: string;
  text: string;
  required_item?: string;
  is_risky?: boolean;
  unlocksBranch?: string; // Unlocks a story branch
  locksBranch?: string; // Locks a story branch
}

export interface GameResponse {
  id?: string; // Scenario ID for image mapping
  story_text: string;
  image_prompt: string;
  choices: Choice[];
  stats_update: {
    money_change: number;
    stress_change: number;
    energy_change: number;
    day_change: number;
    health_change?: number;
    happiness_change?: number;
  };
  new_items?: string[];
  game_state: string;
  branch?: StoryBranch; // Branch information
}

export interface StoryLog {
  action: string;
  summary: string;
}

export interface GameState {
  stats: GameStats;
  profile: CharacterProfile;
  inventory: string[];
  history: StoryLog[];
  currentScene?: GameResponse | null;
  settings: GameSettings; // Added game settings
  achievements?: string[]; // Unlocked achievement IDs
  triggeredEvents?: string[]; // Already triggered event IDs
  unlockedBranches?: string[]; // Unlocked story branches
  lockedBranches?: string[]; // Locked story branches
}
