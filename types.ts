
export type ProfileClass = "ඇමති පුතා" | "Business Family" | "Middle Class" | "Lower Class";
export type Gender = "Male" | "Female";
export type RelationshipStatus = "Single" | "Couple" | "With Kids";

export interface CharacterProfile {
  name: string;
  age: number;
  gender: Gender;
  status: RelationshipStatus;
  class: ProfileClass;
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
}

export interface Choice {
  id: string;
  text: string;
  required_item?: string;
  is_risky?: boolean;
}

export interface GameResponse {
  story_text: string;
  image_prompt: string;
  choices: Choice[];
  stats_update: {
    money_change: number;
    stress_change: number;
    energy_change: number;
    day_change: number;
  };
  new_items?: string[];
  game_state: string;
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
}
