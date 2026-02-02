
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getNextStep, generateSceneImage } from './scenarioEngine';
import { generateScene } from './geminiService';
import { ProfileClass, GameStats, GameResponse, Choice, StoryLog, CharacterProfile, Gender, RelationshipStatus, GameState, StoryMode, GameSettings, RandomEvent, Achievement } from './types';
import { StatBar } from './components/StatBar';
import { checkForRandomEvent } from './randomEvents';
import { checkAchievements, ACHIEVEMENTS, getAchievementProgress } from './achievements';

// Supabase Initialization - No more API keys needed!
const supabaseUrl = 'https://mggcjyfnagjttezrqdwx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2NqeWZuYWdqdHRlenJxZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzcwMDYsImV4cCI6MjA4NTUxMzAwNn0.jgmYz6jpp3jJltJC0GlTkB0x0zEf93zkr5GYv1iuPus';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const INITIAL_STATS: Record<ProfileClass, GameStats> = {
  "ඇමති පුතා": { money: 25000, stress: 0, energy: 100, day: 1, health: 100, visaDaysLeft: 90, weeklyRent: 0, lastRentDay: 1, consecutiveWorkDays: 0, happiness: 70 },
  "Business Family": { money: 8000, stress: 10, energy: 100, day: 1, health: 100, visaDaysLeft: 90, weeklyRent: 300, lastRentDay: 1, consecutiveWorkDays: 0, happiness: 60 },
  "Middle Class": { money: 3000, stress: 30, energy: 90, day: 1, health: 90, visaDaysLeft: 90, weeklyRent: 200, lastRentDay: 1, consecutiveWorkDays: 0, happiness: 50 },
  "Lower Class": { money: 1000, stress: 60, energy: 80, day: 1, health: 80, visaDaysLeft: 90, weeklyRent: 150, lastRentDay: 1, consecutiveWorkDays: 0, happiness: 40 }
};

// Sarcastic display names for each class - roasting mode! 🔥
const CLASS_DISPLAY: Record<ProfileClass, { sinhala: string; english: string; subtitle: string; difficulty: string }> = {
  "ඇමති පුතා": {
    sinhala: "ඇමති පුතා",
    english: "Daddy's Little Cash Cow",
    subtitle: '"I don\'t know the price of bread" mode',
    difficulty: "🎮 EASY - Difficulty: Non-existent"
  },
  "Business Family": {
    sinhala: "සල්ලි තියෙන සුද්දා",
    english: 'The "Privileged" Tourist',
    subtitle: "Has a safety net, but still complains about rent",
    difficulty: "⚖️ MODERATE - Living on a prayer & credit card"
  },
  "Middle Class": {
    sinhala: "කටු කන එකා",
    english: "Professional Struggle Artist",
    subtitle: "Eating instant noodles is now a lifestyle choice",
    difficulty: "🔥 HARD - One emergency away from breakdown"
  },
  "Lower Class": {
    sinhala: "අනාථ Life",
    english: "Basically Homeless",
    subtitle: 'The "Melbourne Dream" is currently a nightmare',
    difficulty: "💀 SURVIVAL - Good luck; breathing is free"
  }
};

interface ItemData {
  icon: string;
  category: 'Essentials' | 'Transport' | 'Work' | 'Documents' | 'Other';
  color: string;
}

const ITEM_METADATA: Record<string, ItemData> = {
  "Uber Bag": { icon: "fa-bag-shopping", category: 'Work', color: 'bg-green-500' },
  "Myki Card": { icon: "fa-id-card-clip", category: 'Transport', color: 'bg-blue-500' },
  "Passport": { icon: "fa-passport", category: 'Documents', color: 'bg-red-600' },
  "Cash": { icon: "fa-money-bill-1", category: 'Essentials', color: 'bg-emerald-500' },
  "Phone": { icon: "fa-mobile-screen", category: 'Essentials', color: 'bg-slate-600' },
  "SIM Card": { icon: "fa-sim-card", category: 'Essentials', color: 'bg-orange-500' },
  "Backpack": { icon: "fa-backpack", category: 'Essentials', color: 'bg-amber-600' },
  "Laptop": { icon: "fa-laptop", category: 'Work', color: 'bg-indigo-500' },
  "Work Boots": { icon: "fa-boot", category: 'Work', color: 'bg-yellow-700' },
  "High-Vis Vest": { icon: "fa-vest", category: 'Work', color: 'bg-lime-500' },
  "Cleaning Kit": { icon: "fa-bucket", category: 'Work', color: 'bg-cyan-500' },
  "Bicycle": { icon: "fa-bicycle", category: 'Transport', color: 'bg-sky-500' },
  "Car Key": { icon: "fa-key", category: 'Transport', color: 'bg-zinc-500' },
  "Student ID": { icon: "fa-id-card", category: 'Documents', color: 'bg-blue-400' },
  "Tax File Number": { icon: "fa-file-invoice", category: 'Documents', color: 'bg-rose-500' },
  "RSA Certificate": { icon: "fa-certificate", category: 'Documents', color: 'bg-purple-500' },
  "Uber Account": { icon: "fa-car", category: 'Work', color: 'bg-green-600' },
  "Safety Vest": { icon: "fa-vest", category: 'Work', color: 'bg-lime-600' },
  "Winter Jacket": { icon: "fa-shirt", category: 'Essentials', color: 'bg-blue-900' },
  "Sunscreen": { icon: "fa-sun", category: 'Essentials', color: 'bg-yellow-400' }
};

const getItemMetadata = (itemName: string): ItemData => {
  const key = Object.keys(ITEM_METADATA).find(k => itemName.toLowerCase().includes(k.toLowerCase()));
  return key ? ITEM_METADATA[key] : { icon: "fa-tag", category: 'Other', color: 'bg-slate-500' };
};

// Item effects - what each item provides when used/collected
const ITEM_EFFECTS: Record<string, { energy?: number; stress?: number; money?: number; health?: number; unlocks?: string }> = {
  "Uber Bag": { money: 150, unlocks: "Delivery jobs" },
  "Myki Card": { unlocks: "Public transport", stress: -5 },
  "Passport": { unlocks: "ID verification, Bank account" },
  "Phone": { unlocks: "Job applications, Maps", stress: -5 },
  "SIM Card": { unlocks: "Communication" },
  "Laptop": { money: 200, unlocks: "Remote work, Study" },
  "Work Boots": { unlocks: "Construction jobs" },
  "High-Vis Vest": { unlocks: "Warehouse jobs" },
  "Cleaning Kit": { money: 100, unlocks: "Cleaning jobs" },
  "Bicycle": { energy: 10, unlocks: "Fast transport, Exercise" },
  "Car Key": { unlocks: "Uber driving, Long trips" },
  "Student ID": { unlocks: "Discounts, Library access" },
  "Tax File Number": { unlocks: "Legal employment" },
  "RSA Certificate": { unlocks: "Bar/Restaurant jobs" },
  "Winter Jacket": { health: 10, stress: -5 },
  "Sunscreen": { health: 5 },
  "Backpack": { unlocks: "Carry more items" },
  "Safety Vest": { unlocks: "Traffic controller jobs" },
  "Uber Account": { money: 200, unlocks: "Ride-share driving" }
};

// Removed redundant local interface and augmentation as window.aistudio is provided by the environment

const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  useEffect(() => { setDisplayedText(""); setIndex(0); }, [text]);
  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);
  return <span>{displayedText}</span>;
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [screen, setScreen] = useState<'auth' | 'start' | 'register' | 'mode-select' | 'class-select' | 'loading' | 'game' | 'gameover' | 'victory' | 'ending'>('auth');
  const [winReason, setWinReason] = useState<string>('');
  const [endingChoice, setEndingChoice] = useState<'house' | 'srilanka' | 'citizen' | null>(null);
  const [character, setCharacter] = useState<Partial<CharacterProfile>>({
    name: '', age: 22, gender: 'Male', status: 'Single'
  });
  const [profileClass, setProfileClass] = useState<ProfileClass | null>(null);
  const [stats, setStats] = useState<GameStats>({ money: 0, stress: 0, energy: 0, day: 1, health: 100, visaDaysLeft: 90, weeklyRent: 0, lastRentDay: 1, consecutiveWorkDays: 0, happiness: 50 });
  const [inventory, setInventory] = useState<string[]>([]);
  const [currentScene, setCurrentScene] = useState<GameResponse | null>(null);
  const [sceneImage, setSceneImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<StoryLog[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingSave, setHasExistingSave] = useState(false);

  // New: Achievements & Events
  const [achievements, setAchievements] = useState<string[]>([]);
  const [triggeredEvents, setTriggeredEvents] = useState<string[]>([]);
  const [unlockedBranches, setUnlockedBranches] = useState<string[]>([]);
  const [lockedBranches, setLockedBranches] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);

  // Game Settings
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    storyMode: 'predefined',
    geminiApiKey: undefined
  });

  // Force predefined mode as default - IMPORTANT for showing local images!
  const [useAI, setUseAI] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  const [inventorySearch, setInventorySearch] = useState("");
  const [inventorySort, setInventorySort] = useState<'newest' | 'alphabetical'>('newest');
  const [inventoryCategory, setInventoryCategory] = useState<'All' | 'Essentials' | 'Transport' | 'Work' | 'Documents'>('All');
  const [statChanges, setStatChanges] = useState<{ id: number; text: string; color: string }[]>([]);
  const changeIdCounter = useRef(0);

  // Survival Progress logic: Target Day 90 for "PR/Settlement" - HARDER MODE
  const progressionPercent = useMemo(() => Math.min(Math.round(((stats.day - 1) / 90) * 100), 100), [stats.day]);

  // Chapter System - 25 CHAPTERS for full PR journey (harder progression)
  const CHAPTERS = [
    // PHASE 1: ARRIVAL (Days 1-7) - 3 chapters
    { id: 1, name: 'Landing පේන්', days: [1, 2], description: 'Airport එකෙන් බහිනවා', icon: '✈️', color: 'orange' },
    { id: 2, name: 'First Night Struggle', days: [3, 4], description: 'කොහෙ නිදාගන්නද?', icon: '😰', color: 'red' },
    { id: 3, name: 'Reality Check', days: [5, 7], description: 'මේ මොකක්ද මේ rate?', icon: '💸', color: 'amber' },

    // PHASE 2: SURVIVAL MODE (Days 8-21) - 5 chapters
    { id: 4, name: 'Accommodation Hunt', days: [8, 10], description: 'ගෙයක් හොයමු', icon: '🏠', color: 'blue' },
    { id: 5, name: 'Scam වලින් බේරෙමු', days: [11, 13], description: 'Contractor අයියලා', icon: '🚨', color: 'red' },
    { id: 6, name: 'Job Hunt Begins', days: [14, 17], description: 'Resume Print කරමු', icon: '📄', color: 'purple' },
    { id: 7, name: 'Visa Agent Drama', days: [18, 19], description: 'Regional යන්නද?', icon: '😤', color: 'orange' },
    { id: 8, name: 'First Paycheck', days: [20, 21], description: 'සල්ලි ඇවිත්ද?', icon: '💰', color: 'green' },

    // PHASE 3: THE GRIND (Days 22-42) - 7 chapters
    { id: 9, name: 'Cleaning Contractor Scam', days: [22, 24], description: 'මාස 2ක pay නෑ', icon: '🧹', color: 'red' },
    { id: 10, name: 'Dandenong Car Scam', days: [25, 27], description: 'German Tech අයියා', icon: '🚗', color: 'amber' },
    { id: 11, name: 'Love Trap', days: [28, 31], description: 'GF/BF Drama', icon: '💔', color: 'pink' },
    { id: 12, name: 'Job Broker Scam', days: [32, 35], description: '$500 ගෙවලා job?', icon: '🤝', color: 'red' },
    { id: 13, name: 'COE Cancelled', days: [36, 38], description: 'University problems', icon: '📚', color: 'purple' },
    { id: 14, name: 'Hustle Mode', days: [39, 42], description: 'Multiple jobs', icon: '💪', color: 'blue' },

    // PHASE 4: BUILDING ROOTS (Days 43-63) - 5 chapters
    { id: 15, name: 'Real Friends', days: [43, 46], description: 'Trust issues', icon: '👥', color: 'cyan' },
    { id: 16, name: 'Savings Game', days: [47, 51], description: 'Bank balance', icon: '🏦', color: 'green' },
    { id: 17, name: 'Visa Extension', days: [52, 55], description: 'Documents ready?', icon: '📋', color: 'amber' },
    { id: 18, name: 'Skill Recognition', days: [56, 59], description: 'Degree valid ද?', icon: '🎓', color: 'purple' },
    { id: 19, name: 'Tax Time', days: [60, 63], description: 'ATO එක්ක dance', icon: '📊', color: 'blue' },

    // PHASE 5: PATH TO PR (Days 64-90) - 6 chapters
    { id: 20, name: 'PR Points Check', days: [64, 68], description: 'Points ඇතිද?', icon: '✅', color: 'green' },
    { id: 21, name: 'Health Check', days: [69, 72], description: 'Medical exam', icon: '🏥', color: 'pink' },
    { id: 22, name: 'Police Clearance', days: [73, 77], description: 'Character test', icon: '👮', color: 'blue' },
    { id: 23, name: 'EOI Submission', days: [78, 82], description: 'Waiting game', icon: '⏳', color: 'amber' },
    { id: 24, name: 'ITA Received', days: [83, 87], description: 'Invitation!', icon: '📨', color: 'cyan' },
    { id: 25, name: 'PR Granted!', days: [88, 90], description: 'ජය වේවා!', icon: '🏆', color: 'green' }
  ];

  const currentChapter = useMemo(() => {
    return CHAPTERS.find(ch => stats.day >= ch.days[0] && stats.day <= ch.days[1]) || CHAPTERS[0];
  }, [stats.day]);

  const chapterProgress = useMemo(() => {
    const ch = currentChapter;
    const daysInChapter = ch.days[1] - ch.days[0] + 1;
    const dayInChapter = stats.day - ch.days[0] + 1;
    return Math.round((dayInChapter / daysInChapter) * 100);
  }, [stats.day, currentChapter]);

  // Check for stored API key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('mlife_gemini_key');
    if (storedKey) {
      setApiKey(storedKey);
      setUseAI(true);
      setGameSettings(prev => ({ ...prev, storyMode: 'ai-creative', geminiApiKey: storedKey }));
      console.log('🔑 Loaded API key from storage, AI mode enabled');
    }
  }, []);

  // Auth & Session Logic
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setScreen('start');
        checkSave(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setScreen('start');
        checkSave(session.user.id);
      } else {
        setScreen('auth');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check for guest save on mount
    if (!session) {
      const guestSave = localStorage.getItem('mlife_guest_save');
      if (guestSave) setHasExistingSave(true);
    }
  }, [screen, session]);

  const checkSave = async (userId: string) => {
    const { data } = await supabase.from('saves').select('data').eq('user_id', userId).single();
    if (data) setHasExistingSave(true);
  };

  const saveGame = async (updatedStats: GameStats, updatedInventory: string[], updatedHistory: StoryLog[], updatedScene: GameResponse | null) => {
    setIsSaving(true);
    const state: GameState = {
      stats: updatedStats,
      profile: { ...character, class: profileClass! } as CharacterProfile,
      inventory: updatedInventory,
      history: updatedHistory,
      currentScene: updatedScene,
      settings: gameSettings // Save game settings
    };

    if (session) {
      await supabase.from('saves').upsert({
        user_id: session.user.id,
        data: state,
        updated_at: new Date()
      });
    } else {
      localStorage.setItem('mlife_guest_save', JSON.stringify(state));
    }
    setTimeout(() => setIsSaving(false), 800);
  };

  const loadGame = async () => {
    let savedState: any = null;
    if (session) {
      const { data } = await supabase.from('saves').select('data').eq('user_id', session.user.id).single();
      if (data) savedState = data.data;
    } else {
      const local = localStorage.getItem('mlife_guest_save');
      if (local) savedState = JSON.parse(local);
    }

    if (savedState) {
      setStats(savedState.stats);
      setProfileClass(savedState.profile.class);
      setCharacter(savedState.profile);
      setInventory(savedState.inventory);
      setHistory(savedState.history);
      setCurrentScene(savedState.currentScene);

      // Load game settings
      if (savedState.settings) {
        setGameSettings(savedState.settings);
      }

      setScreen('loading');
      if (savedState.currentScene) {
        const img = await generateSceneImage(
          savedState.currentScene.image_prompt,
          savedState.currentScene.id,
          savedState.settings?.storyMode || 'predefined',
          savedState.settings?.geminiApiKey
        );
        setSceneImage(img);
        setScreen('game');
      } else {
        // Fallback if scene wasn't saved correctly
        startGame(savedState.profile.class);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetGame();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const startGame = async (selectedClass: ProfileClass) => {
    // Update game settings based on mode selection
    const currentSettings: GameSettings = {
      storyMode: useAI ? 'ai-creative' : 'predefined',
      geminiApiKey: useAI ? apiKey : undefined
    };
    setGameSettings(currentSettings);

    // DEBUG: Log which mode is being used
    console.log('🎮 Starting game in mode:', currentSettings.storyMode);
    console.log('📸 Image source:', currentSettings.storyMode === 'predefined' ? 'Local images from /public/images/story/' : 'AI Generated via Gemini');

    const fullProfile = { ...character, class: selectedClass } as CharacterProfile;
    setProfileClass(selectedClass);
    setStats(INITIAL_STATS[selectedClass]);
    setInventory([]);
    setHistory([]);
    setScreen('loading');

    try {
      const initialScene = await getNextStep(fullProfile, "Arrival at Melbourne Airport", [], []);
      setCurrentScene(initialScene);
      const img = await generateSceneImage(
        initialScene.image_prompt,
        initialScene.id,
        currentSettings.storyMode,
        currentSettings.geminiApiKey
      );
      setSceneImage(img);
      setScreen('game');
      // Initial save
      saveGame(INITIAL_STATS[selectedClass], [], [], initialScene);
    } catch (error: any) {
      console.error("Error starting game:", error);
      setScreen('class-select');
    }
  };

  const handleChoice = async (choice: Choice) => {
    if (!profileClass || isProcessing) return;
    setIsProcessing(true);

    const updatedHistory = [...history.slice(-10), {
      action: choice.text,
      summary: currentScene?.story_text.substring(0, 100) || ""
    }];
    setHistory(updatedHistory);

    try {
      const fullProfile = { ...character, class: profileClass } as CharacterProfile;

      // Use AI mode or pre-defined scenarios
      let nextScene: GameResponse;
      console.log('🎮 Mode check:', { storyMode: gameSettings.storyMode, hasKey: !!gameSettings.geminiApiKey });

      if (gameSettings.storyMode === 'ai-creative' && gameSettings.geminiApiKey) {
        console.log('🤖 Using AI mode to generate scene...');
        const contextSummary = updatedHistory.map(h => h.summary).join(' ');
        try {
          nextScene = await generateScene(contextSummary, choice.text, fullProfile, stats, inventory);
          console.log('✅ AI scene generated:', nextScene.story_text.substring(0, 50) + '...');
        } catch (aiError) {
          console.error('❌ AI generation failed, falling back to predefined:', aiError);
          nextScene = await getNextStep(fullProfile, choice.text, updatedHistory, inventory);
        }
      } else {
        console.log('📖 Using predefined scenarios');
        nextScene = await getNextStep(fullProfile, choice.text, updatedHistory, inventory);
      }

      const { money_change, stress_change, energy_change, day_change } = nextScene.stats_update;

      const changes = [];
      if (money_change !== 0) changes.push({ id: ++changeIdCounter.current, text: `${money_change > 0 ? '+' : ''}${money_change}$`, color: money_change > 0 ? 'text-green-400' : 'text-red-400' });
      if (stress_change !== 0) changes.push({ id: ++changeIdCounter.current, text: `${stress_change > 0 ? '+' : ''}${stress_change} Stress`, color: stress_change > 0 ? 'text-red-400' : 'text-green-400' });
      if (energy_change !== 0) changes.push({ id: ++changeIdCounter.current, text: `${energy_change > 0 ? '+' : ''}${energy_change} Energy`, color: energy_change > 0 ? 'text-blue-400' : 'text-yellow-400' });
      setStatChanges((prev) => [...prev, ...changes]);
      setTimeout(() => setStatChanges((prev) => prev.filter(c => !changes.some(nc => nc.id === c.id))), 2000);

      // Calculate burnout if working
      const isWorkAction = choice.text.toLowerCase().includes('වැඩ') || choice.text.toLowerCase().includes('shift') || choice.text.toLowerCase().includes('work');
      const newConsecutiveWorkDays = isWorkAction ? stats.consecutiveWorkDays + (day_change > 0 ? 1 : 0) : 0;

      // Burnout penalty
      let burnoutStress = 0;
      let burnoutEnergy = 0;
      if (newConsecutiveWorkDays >= 7) {
        burnoutStress = 30;
        burnoutEnergy = -40;
        changes.push({ id: ++changeIdCounter.current, text: 'BURNOUT!', color: 'text-orange-500' });
      }

      // Weekly rent deduction
      const newDay = stats.day + day_change;
      const weeksPassed = Math.floor((newDay - stats.lastRentDay) / 7);
      let rentDeduction = 0;
      let newLastRentDay = stats.lastRentDay;

      if (weeksPassed > 0 && stats.weeklyRent > 0) {
        rentDeduction = stats.weeklyRent * weeksPassed;
        newLastRentDay = stats.lastRentDay + (weeksPassed * 7);
        changes.push({ id: ++changeIdCounter.current, text: `-$${rentDeduction} Rent`, color: 'text-purple-400' });
      }

      // Health degradation from low energy or high stress
      let healthChange = 0;
      if (stats.energy < 30) healthChange -= 5;
      if (stats.stress > 70) healthChange -= 5;
      if (healthChange < 0) {
        changes.push({ id: ++changeIdCounter.current, text: `${healthChange} Health`, color: 'text-red-500' });
      }

      const newStats = {
        money: Math.max(stats.money + money_change - rentDeduction, 0),
        stress: Math.min(Math.max(stats.stress + stress_change + burnoutStress, 0), 100),
        energy: Math.min(Math.max(stats.energy + energy_change + burnoutEnergy, 0), 100),
        health: Math.min(Math.max(stats.health + healthChange, 0), 100),
        day: newDay,
        visaDaysLeft: Math.max(stats.visaDaysLeft - day_change, 0),
        weeklyRent: stats.weeklyRent,
        lastRentDay: newLastRentDay,
        consecutiveWorkDays: newConsecutiveWorkDays,
        happiness: Math.min(Math.max((stats.happiness || 50) + (nextScene.stats_update.happiness_change || 0), 0), 100)
      };

      setStats(newStats);

      let updatedInventory = inventory;
      if (nextScene.new_items && nextScene.new_items.length > 0) {
        updatedInventory = Array.from(new Set([...inventory, ...nextScene.new_items!]));
        setInventory(updatedInventory);
      }

      // Check for achievements
      const gameState: GameState = {
        stats: newStats,
        profile: fullProfile,
        inventory: updatedInventory,
        history: updatedHistory,
        currentScene: nextScene,
        settings: gameSettings,
        achievements,
        triggeredEvents,
        unlockedBranches,
        lockedBranches
      };

      const newAchievements = checkAchievements(gameState, stats);
      if (newAchievements.length > 0) {
        const newAchievement = newAchievements[0];
        setAchievements(prev => [...prev, newAchievement.id]);
        setShowAchievement(newAchievement);
        setTimeout(() => setShowAchievement(null), 4000);
      }

      // Handle branching paths
      if (choice.unlocksBranch) {
        setUnlockedBranches(prev => [...prev, choice.unlocksBranch!]);
      }
      if (choice.locksBranch) {
        setLockedBranches(prev => [...prev, choice.locksBranch!]);
      }

      // WIN CONDITIONS - HARDER MODE! 90 days required for PR!
      // Victory Condition 1: Milestone at Day 30 (No longer victory, just progress)
      if (newStats.day === 30 && newStats.money >= 2000) {
        // Just a checkpoint, not victory!
        console.log('📍 Checkpoint: Day 30 reached!');
      }

      // Victory Condition 2: Milestone at Day 60 (Still not victory!)
      if (newStats.day === 60 && newStats.money >= 5000 && newStats.health >= 50) {
        // Another checkpoint
        console.log('📍 Checkpoint: Day 60 reached!');
      }

      // Victory Condition 3: Day 90 - ONLY WAY TO WIN! PR Settlement Ready!
      if (newStats.day >= 90 && newStats.money >= 8000 && newStats.stress < 80 && newStats.health >= 40) {
        setWinReason('🇦🇺 VICTORY! 90 Days Complete - PR GRANTED! 25 Chapters survived, scams dodged, dreams achieved! You\'re officially an Australian Permanent Resident! 🎉🏆');
        setScreen('victory');
        return;
      }

      // Day 90 but not enough stats - close but no cigar!
      if (newStats.day >= 90 && (newStats.money < 8000 || newStats.stress >= 80 || newStats.health < 40)) {
        setWinReason('😔 Day 90 reached but PR denied! Need: $8000+ savings, <80 stress, 40+ health. Try again!');
        setScreen('gameover');
        return;
      }

      // GAME OVER CONDITIONS - ROASTING SINHALA STYLE! 🌶️
      if (newStats.energy <= 0) {
        setWinReason('💀 Burnout වුනා මචං! ඔබේ Energy ගෙවිලා ගියා! ලංකාවේ "free rice" කන්න යන්න වෙනවා! Too many night shifts without proper rest - you collapsed on the job! 😵');
        setScreen('gameover');
        return;
      }

      if (newStats.stress >= 100) {
        setWinReason('🧠 Mental Breakdown මචං! Stress 100% hit කළා! ඔබෝ! "Melbourne Dream" nightmare වුනා! Migration agent ට ගෙවපු ඩොලර් නිකරුණේ ගියා! 😰');
        setScreen('gameover');
        return;
      }

      if (newStats.health <= 0) {
        setWinReason('🏥 Health Crisis! Ambulance ගාස්තු $2000+ බලන්න! Medicare නැතුව hospital bill එක helicopter ride වගේ! ලංකාවේ ආයුර්වේද treatment ට return ticket එකක් ගන්න වෙනවා! 🚑');
        setScreen('gameover');
        return;
      }

      // Visa expired without achieving settlement
      if (newStats.visaDaysLeft <= 0) {
        setWinReason('✈️ Visa Expired! Immigration Department එකෙන් letter එකක් - "Please leave Australia within 28 days"! අම්මෝ! Bridging visa වත් නැහැ! ලංකාවේ ගිහින් "මම Australia ගියා" කියලා කතා කරන්න වෙනවා! 😅');
        setScreen('gameover');
        return;
      }

      // Bankruptcy - can't afford rent for 2 weeks
      if (newStats.money < 0 && newStats.weeklyRent > 0) {
        setWinReason('💸 Bankruptcy! Rent ගෙවන්න සල්ලි නැහැ! Landlord eviction notice දුන්නා! Clayton අයියලා loan දෙන්නේ නැහැ - "credit score" නැති නිසා! 🏚️');
        setScreen('gameover');
        return;
      }

      // Update scene and image
      setCurrentScene(nextScene);
      setSceneImage(null);
      const img = await generateSceneImage(
        nextScene.image_prompt,
        nextScene.id,
        gameSettings.storyMode,
        gameSettings.geminiApiKey
      );
      setSceneImage(img);

      // Auto-save after every move
      saveGame(newStats, updatedInventory, updatedHistory, nextScene);

      // Check for random events AFTER updating the scene (15% chance to not block too much)
      if (Math.random() < 0.15) {
        const randomEvent = checkForRandomEvent(newStats, triggeredEvents);
        if (randomEvent) {
          setCurrentEvent(randomEvent);
          setTriggeredEvents(prev => [...prev, randomEvent.id]);
          // Don't return - event shows on top of current scene
        }
      }
    } catch (e: any) {
      console.error("Error processing choice:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle random event choice
  const handleEventChoice = (choiceIndex: number) => {
    if (!currentEvent) return;

    const choice = currentEvent.choices![choiceIndex];
    const consequences = choice.consequences;

    const newStats = {
      ...stats,
      money: Math.max((stats.money || 0) + (consequences.money || 0), 0),
      stress: Math.min(Math.max((stats.stress || 0) + (consequences.stress || 0), 0), 100),
      energy: Math.min(Math.max((stats.energy || 0) + (consequences.energy || 0), 0), 100),
      health: Math.min(Math.max((stats.health || 0) + (consequences.health || 0), 0), 100),
      happiness: Math.min(Math.max((stats.happiness || 50) + (consequences.happiness || 0), 0), 100)
    };

    setStats(newStats);

    if (consequences.newItem) {
      setInventory(prev => [...prev, consequences.newItem!]);
    }

    setCurrentEvent(null); // Close event and return to main story
  };

  // Auto-resolve event (for events without choices)
  const resolveAutoEvent = () => {
    if (!currentEvent || !currentEvent.autoResolve) return;

    const resolve = currentEvent.autoResolve;
    const newStats = {
      ...stats,
      money: Math.max((stats.money || 0) + (resolve.money || 0), 0),
      stress: Math.min(Math.max((stats.stress || 0) + (resolve.stress || 0), 0), 100),
      energy: Math.min(Math.max((stats.energy || 0) + (resolve.energy || 0), 0), 100),
      health: Math.min(Math.max((stats.health || 0) + (resolve.health || 0), 0), 100),
      happiness: Math.min(Math.max((stats.happiness || 50) + (resolve.happiness || 0), 0), 100)
    };

    setStats(newStats);
    setCurrentEvent(null);
  };

  const resetGame = () => {
    if (!session) localStorage.removeItem('mlife_guest_save');
    setScreen('start');
    setStats({
      money: 0,
      stress: 0,
      energy: 0,
      day: 1,
      health: 100,
      visaDaysLeft: 90,
      weeklyRent: 0,
      lastRentDay: 1,
      consecutiveWorkDays: 0,
      happiness: 50
    });
    setInventory([]);
    setHistory([]);
    setHasExistingSave(false);
    setCharacter({ name: '', age: 22, gender: 'Male', status: 'Single' });
    setAchievements([]);
    setTriggeredEvents([]);
    setUnlockedBranches([]);
    setLockedBranches([]);
  };

  const processedInventory = useMemo(() => {
    let result = [...inventory];
    if (inventorySearch) result = result.filter(item => item.toLowerCase().includes(inventorySearch.toLowerCase()));
    if (inventoryCategory !== 'All') result = result.filter(item => getItemMetadata(item).category === inventoryCategory);
    if (inventorySort === 'alphabetical') result.sort((a, b) => a.localeCompare(b));
    else result.reverse();
    return result;
  }, [inventory, inventorySearch, inventorySort, inventoryCategory]);

  const renderGame = () => (
    <div className={`flex flex-col min-h-screen bg-slate-950 max-w-2xl mx-auto shadow-2xl relative overflow-hidden transition-all duration-500 ${stats.stress > 80 ? 'shake-intense' : ''}`}>
      {/* Enhanced animated background with multiple layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary blobs */}
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] animate-blob opacity-20 transition-colors duration-[2000ms] ${stats.stress > 70 ? 'bg-red-600' : stats.energy < 30 ? 'bg-yellow-600' : 'bg-blue-600'}`}></div>
        <div className={`absolute bottom-24 right-0 w-80 h-80 rounded-full blur-[100px] animate-blob opacity-20 transition-colors duration-[2000ms] ${stats.money < 100 ? 'bg-red-900' : 'bg-emerald-600'}`} style={{ animationDelay: '-5s' }}></div>
        {/* Additional ambient particles */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl animate-float-particle"></div>
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full bg-cyan-500/10 blur-2xl animate-float-particle" style={{ animationDelay: '-3s' }}></div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      </div>

      {/* Enhanced critical state overlay */}
      {(stats.energy < 25 || stats.stress > 80) && (
        <div className="pointer-events-none absolute inset-0 z-50">
          <div className="absolute inset-0 bg-radial-vignette opacity-50 animate-pulse-fast"></div>
          <div className={`absolute inset-0 opacity-10 ${stats.stress > 80 ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
        </div>
      )}

      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {statChanges.map((change) => (
          <div key={change.id} className={`${change.color} font-black text-xl sinhala animate-float-up drop-shadow-lg text-center`}>{change.text}</div>
        ))}
      </div>

      {/* STICKY HEADER WITH BREADCRUMBS & STATS */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">

        {/* Chapter-Based Breadcrumb Navigation */}
        <div className="px-4 py-2 border-b border-white/5 bg-slate-950/50">
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-slate-500 flex items-center gap-1">
              <i className="fa-solid fa-home"></i> Melbourne
            </span>
            <i className="fa-solid fa-chevron-right text-slate-700 text-[8px]"></i>
            <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${currentChapter.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
              currentChapter.color === 'red' ? 'bg-red-500/20 text-red-400' :
                currentChapter.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                  currentChapter.color === 'green' ? 'bg-green-500/20 text-green-400' :
                    'bg-cyan-500/20 text-cyan-400'
              }`}>
              <span>{currentChapter.icon}</span>
              <span>Ch.{currentChapter.id}: {currentChapter.name}</span>
            </span>
            <i className="fa-solid fa-chevron-right text-slate-700 text-[8px]"></i>
            <span className="text-slate-400">Day {stats.day}</span>
            <div className="flex-grow"></div>
            <span className={`px-2 py-0.5 rounded-full ${gameSettings.storyMode === 'ai-creative' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
              {gameSettings.storyMode === 'ai-creative' ? '🤖 AI Mode' : '📖 Story Mode'}
            </span>
          </div>
          {/* Chapter Progress Bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ${currentChapter.color === 'orange' ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                currentChapter.color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-400' :
                  currentChapter.color === 'amber' ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                    currentChapter.color === 'green' ? 'bg-gradient-to-r from-green-600 to-green-400' :
                      'bg-gradient-to-r from-cyan-600 to-cyan-400'
                }`} style={{ width: `${chapterProgress}%` }}></div>
            </div>
            <span className="text-[9px] text-slate-600 font-bold min-w-[50px] text-right">{chapterProgress}% done</span>
          </div>
        </div>

        {/* Migration Journey Progress */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] uppercase font-black tracking-[0.2em] text-orange-400 flex items-center gap-2">
              <i className="fa-solid fa-route"></i> MIGRATION JOURNEY
            </span>
            <span className="text-[9px] font-black text-slate-500">{progressionPercent}% Settled</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-green-500 transition-all duration-1000 relative"
              style={{ width: `${progressionPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-slate-600">🇱🇰 Start</span>
            <span className="text-[8px] text-slate-600">🏠 PR</span>
            <span className="text-[8px] text-slate-600">🇦🇺 Citizen</span>
          </div>
        </div>

        {/* Character & Quick Actions */}
        <div className="flex justify-between items-center px-4 py-3 border-y border-white/5 bg-slate-800/30">
          <div className="flex gap-3 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white border-2 transition-all duration-500 group-hover:rotate-6 shadow-xl ${character.gender === 'Female' ? 'bg-gradient-to-br from-pink-600 to-pink-700 border-pink-400' : 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-400'}`}>
              <i className={`fa-solid ${character.gender === 'Female' ? 'fa-person-dress' : 'fa-person'} text-2xl`}></i>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest leading-none">{character.name}</p>
                {isSaving && <span className="text-[8px] font-bold text-emerald-500 animate-pulse uppercase flex items-center gap-1"><i className="fa-solid fa-cloud-arrow-up"></i> Saving</span>}
              </div>
              <p className="text-lg font-black text-white leading-tight uppercase tracking-tight">{profileClass}</p>
              <p className="text-[9px] text-slate-500 font-bold">{character.status} • Age {character.age}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Manual Save Button */}
            <button
              onClick={() => currentScene && saveGame(stats, inventory, history, currentScene)}
              disabled={isSaving}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSaving ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/80 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
              title="Save Game"
            >
              <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'} text-lg`}></i>
            </button>
            <button onClick={() => setShowInventory(!showInventory)} className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showInventory ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <i className="fa-solid fa-briefcase text-lg"></i>
              {inventory.length > 0 && !showInventory && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px] font-black text-white animate-bounce">{inventory.length}</span>
              )}
            </button>
            <button onClick={() => setScreen('start')} className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all" title="Main Menu">
              <i className="fa-solid fa-home text-lg"></i>
            </button>
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 px-4 py-2 rounded-2xl border border-white/10 flex flex-col items-center min-w-[56px] shadow-lg">
              <span className="text-[8px] text-slate-500 font-black uppercase leading-none">Day</span>
              <span className="text-xl font-black text-blue-400 leading-none">{stats.day}</span>
            </div>
          </div>
        </div>

        {/* ENHANCED STAT BARS - Bigger & More Stylish */}
        <div className="p-4 space-y-3">
          {/* Top Row - Money, Stress, Energy */}
          <div className="grid grid-cols-3 gap-3">
            <StatBar label="සල්ලි" value={stats.money} max={10000} icon="fa-solid fa-wallet" color="text-emerald-400" size="md" />
            <StatBar label="Stress" value={stats.stress} max={100} icon="fa-solid fa-brain" color="text-red-400" size="md" />
            <StatBar label="පණ" value={stats.energy} max={100} icon="fa-solid fa-bolt-lightning" color="text-blue-400" size="md" />
          </div>

          {/* Bottom Row - Health, Happiness, Visa */}
          <div className="grid grid-cols-3 gap-3">
            <StatBar label="Health" value={stats.health} max={100} icon="fa-solid fa-heart-pulse" color="text-pink-400" size="md" />
            <StatBar label="Happiness" value={stats.happiness || 50} max={100} icon="fa-solid fa-face-smile" color="text-yellow-400" size="md" />
            <div className={`relative p-3 rounded-2xl transition-all duration-300 ${stats.visaDaysLeft < 14 ? 'bg-gradient-to-br from-red-950/80 to-red-900/60 border-2 border-red-500/40 animate-pulse' :
              stats.visaDaysLeft < 30 ? 'bg-gradient-to-br from-orange-950/60 to-orange-900/40 border-2 border-orange-500/30' :
                'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-white/10'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stats.visaDaysLeft < 14 ? 'bg-red-500/30 text-red-400' : 'bg-blue-500/30 text-blue-400'}`}>
                  <i className="fa-solid fa-passport text-sm"></i>
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Visa Days</span>
              </div>
              <div className="flex items-end gap-1">
                <span className={`text-2xl font-black ${stats.visaDaysLeft < 14 ? 'text-red-400 animate-pulse' : stats.visaDaysLeft < 30 ? 'text-orange-400' : 'text-blue-400'}`}>
                  {stats.visaDaysLeft}
                </span>
                <span className="text-xs text-slate-500 font-bold mb-0.5">days</span>
              </div>
              {stats.visaDaysLeft < 14 && (
                <div className="mt-2 flex items-center gap-1 text-red-400">
                  <i className="fa-solid fa-triangle-exclamation text-xs animate-pulse"></i>
                  <span className="text-[9px] font-black">Visa expiring soon!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 space-y-6 pb-28 overflow-y-auto custom-scrollbar relative z-10">
        <div className="relative w-full aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
          {/* Mode indicator on image */}
          <div className={`absolute top-3 left-3 z-30 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-2 backdrop-blur-md ${gameSettings.storyMode === 'predefined' ? 'bg-green-500/90 text-white' : 'bg-purple-500/90 text-white'}`}>
            <i className={`fa-solid ${gameSettings.storyMode === 'predefined' ? 'fa-book' : 'fa-robot'}`}></i>
            {gameSettings.storyMode === 'predefined' ? 'STORY MODE' : 'AI MODE'}
          </div>

          {sceneImage ? (
            <img
              src={sceneImage}
              alt="Scene illustration"
              className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${stats.stress > 80 ? 'saturate-[1.5] contrast-[1.2]' : ''}`}
              loading="lazy"
              onLoad={() => console.log('✅ Image loaded:', sceneImage)}
              onError={(e) => {
                console.error('❌ Image failed to load:', sceneImage);
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1024&h=768&fit=crop';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 animate-pulse bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Generating Scene...</p>
            </div>
          )}
          {isProcessing && <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-20"><div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div></div>}
        </div>

        {/* Enhanced story card with glass morphism and gradient border */}
        <div className="relative group">
          {/* Animated gradient border */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-orange-500 via-red-500 to-green-500 rounded-[2.5rem] opacity-50 blur-sm group-hover:opacity-75 transition-opacity duration-500"></div>
          <div className="relative glass-dark p-8 rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Animated side accent */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 via-red-500 to-green-500 rounded-l-full"></div>
            <div className="absolute top-0 left-0 w-1.5 bg-white/50 rounded-l-full transition-all duration-700 ease-out" style={{ height: `${Math.min((currentScene?.story_text?.length || 0) / 5, 100)}%` }}></div>
            {/* Story text */}
            <p className="sinhala text-xl leading-relaxed text-slate-100 font-medium pl-4"><TypewriterText text={currentScene?.story_text || ""} /></p>
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </div>
        </div>

        {/* Enhanced Choices with premium styling */}
        <div className="grid gap-4">
          {currentScene?.choices.map((choice, idx) => {
            const hasRequired = !choice.required_item || inventory.includes(choice.required_item);
            return (
              <button
                key={choice.id}
                disabled={isProcessing || !hasRequired}
                onClick={() => handleChoice(choice)}
                className={`sinhala text-left p-5 rounded-[1.5rem] border transition-all duration-300 transform group relative overflow-hidden btn-ripple
                  ${!hasRequired
                    ? 'opacity-40 grayscale cursor-not-allowed bg-slate-900/30 border-slate-800'
                    : isProcessing
                      ? 'opacity-50 cursor-wait bg-slate-900/50 border-slate-700'
                      : 'glass border-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 card-hover'}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Animated background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${choice.is_risky ? 'from-orange-500/10 to-red-500/10' : 'from-blue-500/10 to-cyan-500/10'}`}></div>
                {/* Corner decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150 ${choice.is_risky ? 'bg-gradient-to-br from-orange-500/20 to-transparent' : 'bg-gradient-to-br from-blue-500/10 to-transparent'}`}></div>

                <div className="flex items-start gap-5 relative z-10">
                  {/* Choice number/icon */}
                  <span className={`w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center font-black shrink-0 mt-0.5 text-lg shadow-lg ${choice.is_risky
                    ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white border-2 border-orange-400/50 shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-110'
                    : 'bg-slate-800 text-slate-400 border border-white/10 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:border-blue-400/50 group-hover:shadow-blue-500/30 group-hover:scale-110'
                    }`}>
                    {choice.is_risky ? <i className="fa-solid fa-skull animate-bounce-subtle"></i> : idx + 1}
                  </span>

                  <div className="flex flex-col flex-grow gap-2">
                    {/* Choice text */}
                    <span className="text-lg font-bold leading-tight text-slate-200 group-hover:text-white transition-colors duration-300">{choice.text}</span>

                    {/* Tags container */}
                    <div className="flex flex-wrap gap-2">
                      {choice.required_item && (
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${hasRequired
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                          <i className={`fa-solid ${hasRequired ? 'fa-check-circle' : 'fa-lock'} text-[10px]`}></i>
                          {hasRequired ? 'Has' : 'Needs'}: {choice.required_item}
                        </span>
                      )}
                      {choice.is_risky && (
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30">
                          <i className="fa-solid fa-triangle-exclamation animate-pulse"></i> RISKY
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                    <i className="fa-solid fa-chevron-right text-white/50"></i>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showInventory && (
        <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl p-4 pt-20 animate-in fade-in duration-300 flex items-center justify-center">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-white/10 rounded-[3rem] p-6 shadow-2xl w-full max-w-lg h-[90vh] flex flex-col relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10 px-2">
              <div>
                <h3 className="text-3xl font-black sinhala flex items-center gap-4 text-white">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <i className="fa-solid fa-box-open text-2xl text-white"></i>
                  </div>
                  මගේ බඩු
                </h3>
                <p className="text-slate-500 text-xs mt-1 ml-[70px]">{inventory.length} items collected</p>
              </div>
              <button onClick={() => { setShowInventory(false); setInventorySearch(""); }} className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-slate-500 transition-all">
                <i className="fa-solid fa-times text-lg"></i>
              </button>
            </div>

            {/* How Inventory Works - Info Box */}
            <div className="relative z-10 mb-4 px-2">
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-lightbulb text-amber-400"></i>
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-black text-sm mb-1">How to Use Items</h4>
                    <p className="text-amber-200/70 text-xs leading-relaxed">
                      Items unlock special choices in the story! 🔓 Look for choices marked with
                      <span className="text-blue-400 font-bold"> "Needs: [Item]"</span>.
                      Collect items by making good choices and exploring Melbourne!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="relative z-10 space-y-3 mb-4 px-2">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input type="text" placeholder="බඩු හොයන්න..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} className="w-full bg-slate-800/50 border-2 border-white/10 p-4 pl-12 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-sm sinhala placeholder:opacity-50" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {(['All', 'Essentials', 'Transport', 'Work', 'Documents'] as const).map(cat => (
                  <button key={cat} onClick={() => setInventoryCategory(cat)} className={`whitespace-nowrap py-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${inventoryCategory === cat ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                    {cat === 'Essentials' && '🎒 '}
                    {cat === 'Transport' && '🚌 '}
                    {cat === 'Work' && '💼 '}
                    {cat === 'Documents' && '📄 '}
                    {cat === 'All' && '📦 '}
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setInventorySort('newest')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inventorySort === 'newest' ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 shadow-md' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}><i className="fa-solid fa-clock-rotate-left mr-2"></i> Newest</button>
                <button onClick={() => setInventorySort('alphabetical')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inventorySort === 'alphabetical' ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 shadow-md' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}><i className="fa-solid fa-sort-alpha-down mr-2"></i> A-Z</button>
              </div>
            </div>

            {/* Item Grid */}
            <div className="flex-grow grid grid-cols-2 gap-4 overflow-y-auto pr-2 px-2 custom-scrollbar relative z-10 pb-6">
              {processedInventory.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-ghost text-5xl text-slate-600"></i>
                  </div>
                  <p className="sinhala text-xl font-black uppercase tracking-tighter text-slate-600">මුකුත් නෑ මචං</p>
                  <p className="text-xs text-slate-700 mt-2">Make choices to collect items!</p>
                </div>
              ) : (
                processedInventory.map((item, idx) => {
                  const meta = getItemMetadata(item);
                  const itemEffects = ITEM_EFFECTS[item];
                  return (
                    <div key={idx} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-3xl border-2 border-white/5 flex flex-col gap-3 hover:border-blue-500/40 hover:from-slate-800 hover:to-slate-700 transition-all group animate-in zoom-in duration-300 relative overflow-hidden">
                      {/* Category tag */}
                      <div className={`absolute top-2 right-2 text-[7px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${meta.color}/20 ${meta.color.replace('bg-', 'text-')}`}>
                        {meta.category}
                      </div>

                      {/* Item icon */}
                      <div className={`w-14 h-14 rounded-2xl ${meta.color}/20 flex items-center justify-center ${meta.color.replace('bg-', 'text-')} group-hover:scale-110 group-hover:${meta.color} group-hover:text-white transition-all shadow-xl border-2 border-white/5`}>
                        <i className={`fa-solid ${meta.icon} text-xl`}></i>
                      </div>

                      {/* Item name */}
                      <div className="flex flex-col">
                        <span className="leading-tight text-white text-sm font-black sinhala">{item}</span>

                        {/* Item effect hint */}
                        {itemEffects && (
                          <div className="mt-2 text-[9px] text-slate-400 space-y-0.5">
                            {itemEffects.energy && <span className="block"><i className="fa-solid fa-bolt text-blue-400 mr-1"></i>+{itemEffects.energy} Energy</span>}
                            {itemEffects.stress && <span className="block"><i className="fa-solid fa-brain text-green-400 mr-1"></i>{itemEffects.stress} Stress</span>}
                            {itemEffects.money && <span className="block"><i className="fa-solid fa-wallet text-emerald-400 mr-1"></i>+{itemEffects.money}$ potential</span>}
                            {itemEffects.unlocks && <span className="block text-purple-400"><i className="fa-solid fa-key mr-1"></i>Unlocks: {itemEffects.unlocks}</span>}
                          </div>
                        )}

                        <div className="w-6 h-1 bg-white/10 rounded-full mt-3 group-hover:w-full group-hover:bg-blue-500 transition-all"></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer tip */}
            <div className="relative z-10 pt-4 border-t border-white/5 px-2">
              <p className="text-[10px] text-slate-500 text-center">
                <i className="fa-solid fa-info-circle mr-1"></i>
                Items are automatically used when you select a choice that requires them
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAuth = () => (
    <div className="flex flex-col items-center min-h-screen bg-slate-950 overflow-hidden relative">
      {/* Enhanced background with floating particles */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        {/* Sri Lankan Flag gradient blur */}
        <div className="absolute top-0 left-0 w-2/3 h-1/3 bg-gradient-to-br from-amber-600/20 to-transparent blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-2/3 h-1/3 bg-gradient-to-bl from-red-800/20 to-transparent blur-3xl animate-blob" style={{ animationDelay: '-5s' }}></div>
        <div className="absolute bottom-0 left-1/4 w-2/3 h-1/3 bg-gradient-to-t from-green-700/20 to-transparent blur-3xl animate-blob" style={{ animationDelay: '-10s' }}></div>
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/30 rounded-full animate-float-particle"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-red-400/20 rounded-full animate-float-particle" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-green-400/30 rounded-full animate-float-particle" style={{ animationDelay: '-4s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-float-particle" style={{ animationDelay: '-6s' }}></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      </div>

      {/* Comic-style Header Banner */}
      <div className="w-full bg-gradient-to-r from-amber-600 via-red-700 to-green-700 py-2 text-center relative z-10">
        <p className="text-white text-xs font-black tracking-[0.3em] uppercase">🎮 Sri Lanka's #1 Immigration Survival Adventure Game 🎮</p>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-4xl relative z-10">

        {/* Comic-style Logo Section */}
        <div className="relative mb-8 animate-fade-in-scale">
          {/* Starburst background */}
          <div className="absolute -inset-16 opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
              <polygon points="100,10 120,80 190,80 140,120 160,190 100,150 40,190 60,120 10,80 80,80" fill="url(#starGrad)" />
              <defs>
                <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Flags with plane */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl md:text-6xl drop-shadow-2xl animate-bounce" style={{ animationDuration: '2s' }}>🇱🇰</span>
            <div className="relative">
              <i className="fa-solid fa-plane text-4xl md:text-5xl text-cyan-400 animate-pulse drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]"></i>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            </div>
            <span className="text-5xl md:text-6xl drop-shadow-2xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>🇦🇺</span>
          </div>

          {/* Main Title - Comic style */}
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-center leading-none">
              <span className="block bg-gradient-to-r from-orange-400 via-red-500 to-green-500 bg-clip-text text-transparent drop-shadow-2xl" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
                MELBOURNE
              </span>
              <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
                LIFE
              </span>
            </h1>
            {/* Comic speech bubble style subtitle */}
            <div className="absolute -right-4 md:-right-8 top-0 bg-white text-slate-900 px-3 py-1 rounded-lg text-xs font-black transform rotate-12 shadow-lg border-2 border-slate-900">
              NEW!
            </div>
          </div>

          {/* Sinhala subtitle */}
          <p className="text-3xl md:text-4xl sinhala font-black text-center mt-2 bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            මෙල්බර්න් ජීවිතය
          </p>
          <p className="text-slate-400 text-sm md:text-base mt-2 font-bold tracking-wider text-center">
            🎭 Interactive Comic Adventure • Immigration Survival Simulator
          </p>
        </div>

        {/* Features showcase - Comic panel style */}
        <div className="w-full max-w-3xl mb-8 grid grid-cols-3 gap-2 md:gap-4 animate-fade-in-up stagger-1">
          <div className="bg-slate-900/80 border-2 border-orange-500/30 rounded-2xl p-3 md:p-4 text-center transform hover:scale-105 transition-all hover:shadow-lg hover:shadow-orange-500/20 card-hover">
            <div className="text-3xl md:text-4xl mb-2">📖</div>
            <p className="text-orange-400 font-black text-xs md:text-sm">CHAPTERS</p>
            <p className="text-slate-500 text-[10px] md:text-xs mt-1">Story-driven gameplay</p>
          </div>
          <div className="bg-slate-900/80 border-2 border-red-500/30 rounded-2xl p-3 md:p-4 text-center transform hover:scale-105 transition-all hover:shadow-lg hover:shadow-red-500/20 card-hover">
            <div className="text-3xl md:text-4xl mb-2">🎯</div>
            <p className="text-red-400 font-black text-xs md:text-sm">CHOICES</p>
            <p className="text-slate-500 text-[10px] md:text-xs mt-1">Your decisions matter</p>
          </div>
          <div className="bg-slate-900/80 border-2 border-green-500/30 rounded-2xl p-3 md:p-4 text-center transform hover:scale-105 transition-all hover:shadow-lg hover:shadow-green-500/20 card-hover">
            <div className="text-3xl md:text-4xl mb-2">🏆</div>
            <p className="text-green-400 font-black text-xs md:text-sm">VICTORY</p>
            <p className="text-slate-500 text-[10px] md:text-xs mt-1">Achieve your dreams</p>
          </div>
        </div>

        {/* Login Card - Comic panel style */}
        <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-4 border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-fade-in-up stagger-2">
          {/* Corner decoration */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-500/20 to-transparent"></div>

          <h2 className="text-xl md:text-2xl font-black text-center mb-6 text-white">
            <i className="fa-solid fa-gamepad mr-2 text-cyan-400"></i>START YOUR JOURNEY
          </h2>

          {/* Google Login - Enhanced with glow */}
          <button onClick={handleGoogleLogin} className="btn-enhanced group w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-100 text-slate-900 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 md:w-7 md:h-7 relative z-10 transition-transform group-hover:rotate-12" alt="G" />
            <span className="relative z-10">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span className="text-slate-500 text-xs font-bold uppercase">or</span>
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Guest Mode - Enhanced */}
          <button onClick={() => setScreen('start')} className="btn-enhanced w-full py-4 md:py-5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-2xl font-black text-base md:text-lg transition-all flex items-center justify-center gap-3 border-2 border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/20 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <i className="fa-solid fa-user-secret text-slate-400 group-hover:text-cyan-400 transition-colors relative z-10"></i>
            <span className="relative z-10">Play as Guest</span>
          </button>

          <p className="text-[10px] md:text-xs text-slate-500 text-center mt-4 leading-relaxed">
            <i className="fa-solid fa-cloud mr-1"></i>Google login syncs saves across devices<br />
            <i className="fa-solid fa-laptop mr-1"></i>Guest saves stored locally only
          </p>
        </div>

        {/* Chapter preview - 25 CHAPTERS */}
        <div className="w-full max-w-3xl mt-8">
          <h3 className="text-center text-slate-500 font-black text-xs uppercase tracking-widest mb-4">📚 25 Chapters to PR - Can You Survive?</h3>
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {[
              { name: '✈️ Landing', phase: 1 },
              { name: '🚨 Scams', phase: 2 },
              { name: '💼 Hustle', phase: 3 },
              { name: '💔 Drama', phase: 4 },
              { name: '🏆 PR!', phase: 5 }
            ].map((ch, i) => (
              <div key={i} className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 text-xs font-bold ${i === 0 ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
                Phase {ch.phase}: {ch.name}
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 text-[10px] mt-2">⚠️ Warning: Contractor scams, visa agent tricks, job brokers & more await!</p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full py-4 text-center border-t border-white/5 relative z-10">
        <p className="text-slate-600 text-xs">Made with ❤️ for Sri Lankan immigrants • v2.0</p>
      </div>
    </div>
  );

  const renderStart = () => (
    <div className="flex flex-col items-center min-h-screen p-6 text-center bg-slate-950 relative overflow-hidden">
      {/* Subtle background - POINTER EVENTS NONE to allow clicks through */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.15)_0%,transparent_40%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(22,163,74,0.15)_0%,transparent_40%)] pointer-events-none"></div>
      </div>

      {/* Header */}
      <div className="w-full bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 py-4 mb-8 border-b border-white/5">
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl">🇱🇰</span>
          <i className="fa-solid fa-plane text-2xl text-cyan-400"></i>
          <span className="text-3xl">🇦🇺</span>
        </div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-green-500 bg-clip-text text-transparent mt-2">MELBOURNE LIFE</h1>
      </div>

      {/* Player Status */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 px-6 py-3 rounded-2xl border border-white/10 mb-6 flex items-center gap-3 backdrop-blur-xl">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-slate-200 font-bold">{session ? session.user.user_metadata?.full_name?.split(' ')[0] : 'Guest'}</span>
        {session && <span className="text-slate-500 text-xs">☁️ Synced</span>}
        {!session && <span className="text-slate-500 text-xs">💻 Local</span>}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl relative z-10 flex-grow flex flex-col">

        {/* 25 CHAPTERS - 5 PHASES Breakdown - SINHALA SLANG VERSION 🇱🇰 */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-6 shadow-2xl">
          <h3 className="text-lg font-black text-white mb-5 flex items-center justify-center gap-2 sinhala">
            <i className="fa-solid fa-book text-amber-400"></i> චැප්ටර් 25ක් • Phase 5ක්
          </h3>
          <p className="text-slate-500 text-xs text-center mb-4">"Melbourne Dream" කියලා හීන මවන්නේ ඇයි? 🤡</p>

          {/* Phase Cards - Sinhala Slang */}
          <div className="space-y-3 mb-6">
            {/* Phase 1 */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-xl p-3 border border-orange-500/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✈️</span>
                <div>
                  <span className="text-orange-400 font-black text-sm sinhala">PHASE 1: ලෑන්ඩ් වෙනවා</span>
                  <span className="text-slate-500 text-xs ml-2">(දවස් 1-7 • Ch 1-3)</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs sinhala">Airport එකේ බැග් හොයනවා, පළවෙනි රෑ කොහෙ නිදාගන්නද? 💸 මේ rate මොකක්ද? 😱</p>
            </div>

            {/* Phase 2 */}
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/5 rounded-xl p-3 border border-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🚨</span>
                <div>
                  <span className="text-red-400 font-black text-sm sinhala">PHASE 2: කට්ට කන කාලේ</span>
                  <span className="text-slate-500 text-xs ml-2">(දවස් 8-21 • Ch 4-8)</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs sinhala">ගෙයක් හොයනවා (ලොකු ජෝක්), Contractor scam 🕵️, Visa agent උඹලා regional යන්න 😤, පළමු pay එක 💰</p>
            </div>

            {/* Phase 3 */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-xl p-3 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💼</span>
                <div>
                  <span className="text-amber-400 font-black text-sm sinhala">PHASE 3: ගේම දෙනවා</span>
                  <span className="text-slate-500 text-xs ml-2">(දවස් 22-42 • Ch 9-14)</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs sinhala">Cleaning contractor pay නැහැ 🧹, Dandenong car scam 🚗, Gold Digger GF/BF 💔, Job broker $500 ගහනවා 🤝</p>
            </div>

            {/* Phase 4 */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-xl p-3 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏗️</span>
                <div>
                  <span className="text-blue-400 font-black text-sm sinhala">PHASE 4: ටිකක් හදා ගන්නවා</span>
                  <span className="text-slate-500 text-xs ml-2">(දවස් 43-63 • Ch 15-19)</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs sinhala">Real යාළුවො vs Fake යාළුවො 👥, සල්ලි ගොඩ දාමු 🏦, Visa extend, Skill Assessment, Tax return 📊</p>
            </div>

            {/* Phase 5 */}
            <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-xl p-3 border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <span className="text-green-400 font-black text-sm sinhala">PHASE 5: PR ගේමට</span>
                  <span className="text-slate-500 text-xs ml-2">(දවස් 64-90 • Ch 20-25)</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs sinhala">Points ඇතිද? ✅ Medical test 🏥, Police clearance 👮, EOI දානවා ⏳, ITA එනවා 📨, PR ජය! 🎉</p>
            </div>
          </div>
        </div>

        {/* Quick Tips - SINHALA SLANG VERSION 🔥 */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-6 shadow-2xl">
          <h3 className="text-lg font-black text-white mb-4 flex items-center justify-center gap-2 sinhala">
            <i className="fa-solid fa-lightbulb text-yellow-400"></i> බේරෙන්න Tips
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/5">
              <span className="text-2xl">🎯</span>
              <p className="text-white font-bold text-xs mt-2 sinhala">හොඳට බලලා click කරන්න</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/5">
              <span className="text-2xl">🐍</span>
              <p className="text-white font-bold text-xs mt-2 sinhala">හැමෝම "අයියා" නෙවේ</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/5">
              <span className="text-2xl">💸</span>
              <p className="text-white font-bold text-xs mt-2 sinhala">සල්ලි නැතුව මැරෙනවා</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/5">
              <span className="text-2xl">🧠</span>
              <p className="text-white font-bold text-xs mt-2 sinhala">හිතලා action එකක් ගන්න</p>
            </div>
          </div>
        </div>

        {/* Stats to Manage - SINHALA */}
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 p-4 mb-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 sinhala">⚡ මේවා balance කරන්න ඕනේ - නැත්තං මැරෙනවා</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs font-bold sinhala">💵 සල්ලි ≥$8000</span>
            <span className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-xs font-bold sinhala">😰 Stress &lt;80</span>
            <span className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-bold sinhala">⚡ Energy &gt;0</span>
            <span className="px-3 py-1.5 bg-pink-500/10 text-pink-400 rounded-full text-xs font-bold sinhala">❤️ Health ≥40</span>
            <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold sinhala">📅 දවස් 90</span>
          </div>
          <p className="text-center text-slate-600 text-[10px] mt-3 sinhala">⚠️ PR ගන්න: දවස් 90 + $8000 savings + Stress &lt;80 + Health 40+</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          {hasExistingSave && (
            <button onClick={loadGame} className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-3">
              <i className="fa-solid fa-play"></i> CONTINUE JOURNEY
            </button>
          )}

          <button onClick={() => setScreen('register')} className="w-full py-5 bg-gradient-to-r from-orange-500 via-red-600 to-green-600 hover:from-orange-400 hover:via-red-500 hover:to-green-500 text-white rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-3">
            <i className="fa-solid fa-plane-departure"></i> {hasExistingSave ? 'NEW JOURNEY' : 'START ADVENTURE'}
          </button>

          {hasExistingSave && (
            <button onClick={async () => {
              if (confirm('Delete saved game? This cannot be undone!')) {
                if (session) {
                  await supabase.from('saves').delete().eq('user_id', session.user.id);
                }
                localStorage.removeItem('mlife_guest_save');
                setHasExistingSave(false);
                resetGame();
              }
            }} className="text-red-500/70 hover:text-red-400 font-bold text-xs uppercase tracking-wider py-2 transition-colors">
              <i className="fa-solid fa-trash mr-2"></i>Delete Saved Game
            </button>
          )}
        </div>
      </div>

      {/* Footer - BACK TO LOGIN - ALWAYS SHOW FOR GUESTS */}
      <div className="mt-6 flex flex-col items-center gap-4 relative z-50">
        {/* Logout for logged in users */}
        {session ? (
          <button
            type="button"
            onClick={() => handleLogout()}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-sm uppercase tracking-wider transition-all rounded-2xl flex items-center gap-3 shadow-xl hover:shadow-red-500/30 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket"></i> Logout කරමු
          </button>
        ) : (
          /* Back to Login for guests - ALWAYS VISIBLE */
          <button
            type="button"
            onClick={() => {
              alert('Going back to login page!');
              setScreen('auth');
            }}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider transition-all rounded-2xl flex items-center gap-3 shadow-xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95 border-2 border-cyan-400/50 cursor-pointer select-none"
            style={{ pointerEvents: 'auto' }}
          >
            <i className="fa-solid fa-arrow-left"></i> 🔐 Login Page එකට යමු
          </button>
        )}
        <p className="text-slate-600 text-[10px] sinhala">Guest mode එකේ save local only - Login කරලා cloud sync කරගන්න 👆</p>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 animate-in fade-in duration-1000 relative overflow-hidden">
      <div className="absolute inset-0 bg-red-950/20 animate-pulse"></div>
      <div className="w-36 h-36 bg-red-600/10 border-4 border-red-600/40 rounded-full flex items-center justify-center text-7xl text-red-600 mb-10 animate-bounce relative z-10"><i className="fa-solid fa-face-dizzy"></i></div>
      <h1 className="text-6xl font-black mb-4 sinhala uppercase tracking-tighter text-white relative z-10">ගේම ඉවරයි මචං</h1>
      <p className="text-slate-400 text-xl mb-4 font-medium relative z-10">{winReason || 'මෙල්බර්න් වල කට්ට කන්න අමාරුයි වගේ...'}</p>
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 relative z-10 max-w-md">
        <h3 className="text-white font-bold mb-3">Your Journey Stats:</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-xl"><span className="text-slate-400">Days Survived:</span> <span className="text-white font-bold">{stats.day}</span></div>
          <div className="bg-slate-800/50 p-3 rounded-xl"><span className="text-slate-400">Money:</span> <span className="text-green-400 font-bold">${stats.money}</span></div>
          <div className="bg-slate-800/50 p-3 rounded-xl"><span className="text-slate-400">Achievements:</span> <span className="text-yellow-400 font-bold">{achievements.length}</span></div>
          <div className="bg-slate-800/50 p-3 rounded-xl"><span className="text-slate-400">Progress:</span> <span className="text-blue-400 font-bold">{Math.round((stats.day / 90) * 100)}%</span></div>
        </div>
      </div>
      <p className="text-slate-500 text-lg mb-8 sinhala font-medium relative z-10">ආයෙත් ට්‍රයි එකක් දාමුද?</p>
      <button onClick={resetGame} className="px-14 py-7 bg-gradient-to-r from-orange-500 via-red-600 to-green-600 text-white rounded-[2.5rem] font-black text-2xl hover:scale-110 shadow-2xl flex items-center gap-5 relative z-10 transition-all"><i className="fa-solid fa-rotate-right"></i> ආයෙත් ගේමට</button>
    </div>
  );

  const renderEnding = () => {
    const endings = {
      house: {
        emoji: '🏠',
        title: 'MORTGAGE WARS',
        sinhalaTitle: 'නිවාස ණය යුද්ධය',
        description: 'You\'ve bought your dream house in Melbourne! Now begins the 30-year mortgage journey. Welcome to the Australian dream of paying off a house that costs 12 times your annual salary. Every weekend you\'ll be at Bunnings, every month stressing about interest rates, but hey... you own a piece of Australia! 🏡',
        gradient: 'from-blue-900 via-indigo-900 to-purple-900',
        icon: '💰🏦📈',
        stats: [
          { label: 'Mortgage', value: '$850,000', icon: '💸' },
          { label: 'Interest Rate', value: '6.5%', icon: '📊' },
          { label: 'Weekly Bunnings Trips', value: '∞', icon: '🔨' },
          { label: 'Years to Pay Off', value: '30', icon: '⏰' }
        ]
      },
      srilanka: {
        emoji: '🇱🇰',
        title: 'ANURA HADAI RATA',
        sinhalaTitle: 'අනුර හදයි රට',
        description: 'You\'ve decided to return to Sri Lanka under Anura\'s new vision! With your Melbourne savings and experience, you\'re ready to contribute to building the nation. No more tram rides, no more overpriced coffee - just good hoppers, friendly faces, and the satisfaction of being home. ආයුබෝවන් වෙලා! 🌴',
        gradient: 'from-orange-900 via-red-900 to-maroon-950',
        icon: '🏝️☕🥥',
        stats: [
          { label: 'Savings Brought Back', value: `$${stats.money}`, icon: '💰' },
          { label: 'Hoppers Eaten', value: 'Unlimited', icon: '🥘' },
          { label: 'Beach Visits', value: 'Every Weekend', icon: '🏖️' },
          { label: 'Stress Level', value: '0', icon: '😌' }
        ]
      },
      citizen: {
        emoji: '🛂',
        title: 'AUSTRALIAN PASSPORT & TRAVEL',
        sinhalaTitle: 'ඕස්ට්‍රේලියානු විදේශ ගමන් බලපත්‍රය',
        description: 'Congratulations, mate! You\'re now an Australian citizen with one of the world\'s most powerful passports. Time to explore the globe without visa hassles. From Bali getaways to European adventures, the world is your oyster. Plus, you can now complain about the government like a true Aussie! 🌏✈️',
        gradient: 'from-green-900 via-emerald-900 to-teal-900',
        icon: '✈️🌍🗺️',
        stats: [
          { label: 'Visa-Free Countries', value: '185+', icon: '🌏' },
          { label: 'Passport Power Rank', value: '#6', icon: '🏆' },
          { label: 'Bali Trips Planned', value: '5', icon: '🏝️' },
          { label: 'Pride Level', value: '100%', icon: '🦘' }
        ]
      }
    };

    const ending = endings[endingChoice!];

    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br ${ending.gradient} animate-in fade-in duration-1000 relative overflow-hidden`}>
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent animate-pulse"></div>
        </div>

        {/* Main Emoji */}
        <div className="text-9xl mb-8 relative z-10 animate-bounce">{ending.emoji}</div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-black mb-4 uppercase tracking-tighter text-white relative z-10 drop-shadow-2xl">
          {ending.title}
        </h1>
        <p className="text-4xl sinhala font-black text-yellow-400 relative z-10 mb-8">
          {ending.sinhalaTitle}
        </p>

        {/* Description */}
        <div className="bg-black/30 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 mb-8 relative z-10 max-w-3xl">
          <p className="text-white text-xl leading-relaxed">
            {ending.description}
          </p>
        </div>

        {/* Icon Row */}
        <div className="text-6xl mb-8 relative z-10 flex gap-6">
          {ending.icon.split('').map((emoji, i) => (
            <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 200}ms` }}>{emoji}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10 max-w-4xl w-full">
          {ending.stats.map((stat, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-white/70 text-sm mb-1">{stat.label}</div>
              <div className="text-white text-2xl font-black">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <button
            onClick={resetGame}
            className="px-12 py-6 bg-gradient-to-r from-orange-500 via-red-600 to-green-600 text-white rounded-[2.5rem] font-black text-xl hover:scale-105 shadow-2xl transition-all"
          >
            <i className="fa-solid fa-repeat"></i> New Journey
          </button>
          <button
            onClick={() => setScreen('start')}
            className="px-12 py-6 bg-white/10 hover:bg-white/20 text-white rounded-[2.5rem] font-black text-xl hover:scale-105 shadow-2xl transition-all border-2 border-white/30"
          >
            <i className="fa-solid fa-home"></i> Main Menu
          </button>
        </div>

        {/* Footer */}
        <p className="text-white/50 text-sm mt-8 relative z-10">
          Thanks for playing Melbourne Life! 🇱🇰 → 🇦🇺
        </p>
      </div>
    );
  };

  const renderVictory = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br from-slate-950 via-green-950/30 to-slate-950 animate-in fade-in duration-1000 relative overflow-hidden">
      {/* Celebration Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-amber-600 to-orange-500 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-r from-green-600 to-emerald-500 blur-3xl animate-pulse" style={{ animationDelay: '500ms' }}></div>
        <div className="absolute top-2/3 left-0 w-full h-1/3 bg-gradient-to-r from-blue-600 to-purple-500 blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Victory Icon */}
      <div className="w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-8xl mb-8 relative z-10 animate-bounce shadow-2xl shadow-yellow-500/50">
        <i className="fa-solid fa-trophy text-white"></i>
      </div>

      {/* Victory Title */}
      <h1 className="text-6xl md:text-7xl font-black mb-4 uppercase tracking-tighter bg-gradient-to-r from-yellow-400 via-orange-500 to-green-500 bg-clip-text text-transparent relative z-10 drop-shadow-2xl">
        VICTORY!
      </h1>
      <p className="text-5xl sinhala font-black bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent relative z-10 mb-6">
        ජයග්‍රහණය! 🇱🇰 → 🇦🇺
      </p>

      {/* Win Reason */}
      <p className="text-white text-2xl mb-8 font-bold relative z-10 max-w-2xl leading-relaxed">
        {winReason}
      </p>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-2 border-yellow-500/30 rounded-3xl p-8 mb-8 relative z-10 max-w-2xl w-full shadow-2xl">
        <h3 className="text-yellow-400 font-black text-2xl mb-6 flex items-center justify-center gap-3">
          <i className="fa-solid fa-chart-line"></i> Your Success Story
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-2xl border border-green-500/30">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-green-400 text-sm font-bold">Days</div>
            <div className="text-white text-2xl font-black">{stats.day}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 p-4 rounded-2xl border border-emerald-500/30">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-emerald-400 text-sm font-bold">Money</div>
            <div className="text-white text-2xl font-black">${stats.money}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 p-4 rounded-2xl border border-yellow-500/30">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-yellow-400 text-sm font-bold">Achievements</div>
            <div className="text-white text-2xl font-black">{achievements.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-2xl border border-blue-500/30">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-blue-400 text-sm font-bold">Happiness</div>
            <div className="text-white text-2xl font-black">{stats.happiness || 50}</div>
          </div>
        </div>

        {/* Final Stats */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 mb-1">Health</div>
            <div className={`font-bold ${stats.health > 70 ? 'text-green-400' : stats.health > 40 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.health}/100</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 mb-1">Energy</div>
            <div className={`font-bold ${stats.energy > 70 ? 'text-blue-400' : stats.energy > 40 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.energy}/100</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 mb-1">Stress</div>
            <div className={`font-bold ${stats.stress < 30 ? 'text-green-400' : stats.stress < 70 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.stress}/100</div>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {achievements.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 relative z-10 max-w-2xl w-full">
          <h3 className="text-orange-400 font-black text-xl mb-4 flex items-center justify-center gap-2">
            <i className="fa-solid fa-award"></i> Achievements Unlocked ({achievements.length})
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {achievements.slice(0, 10).map(achId => {
              const ach = ACHIEVEMENTS.find(a => a.id === achId);
              return ach ? (
                <div key={achId} className="bg-slate-800/50 px-3 py-2 rounded-lg border border-yellow-500/20 text-sm">
                  <span className="mr-1">{ach.icon}</span>
                  <span className="text-white font-bold">{ach.title}</span>
                </div>
              ) : null;
            })}\n             {achievements.length > 10 && (
              <div className="bg-slate-800/50 px-3 py-2 rounded-lg border border-white/10 text-sm text-slate-400">
                +{achievements.length - 10} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Congratulations Message */}
      <p className="text-white text-2xl font-bold mb-8 relative z-10 sinhala">
        🎉 Congratulations on your Australian journey! 🇦🇺
      </p>

      {/* Post-Victory Choices */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-yellow-500/30 rounded-3xl p-8 mb-8 relative z-10 max-w-3xl w-full">
        <h3 className="text-yellow-400 font-black text-2xl mb-6 text-center">
          What's Your Next Chapter? 🌟
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Buy a House */}
          <button
            onClick={() => { setEndingChoice('house'); setScreen('ending'); }}
            className="group relative bg-gradient-to-br from-blue-900/50 to-blue-800/30 hover:from-blue-800/70 hover:to-blue-700/50 border-2 border-blue-500/30 hover:border-blue-400/60 rounded-2xl p-6 transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏠</div>
            <h4 className="text-white font-black text-lg mb-2">Buy a House</h4>
            <p className="text-blue-300 text-sm sinhala font-bold">ගෙයක් ගන්න</p>
            <div className="mt-3 text-xs text-blue-400 opacity-70">Start the mortgage journey</div>
          </button>

          {/* Option 2: Go Back to Sri Lanka */}
          <button
            onClick={() => { setEndingChoice('srilanka'); setScreen('ending'); }}
            className="group relative bg-gradient-to-br from-orange-900/50 to-red-800/30 hover:from-orange-800/70 hover:to-red-700/50 border-2 border-orange-500/30 hover:border-orange-400/60 rounded-2xl p-6 transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🇱🇰</div>
            <h4 className="text-white font-black text-lg mb-2">Return Home</h4>
            <p className="text-orange-300 text-sm sinhala font-bold">ආපහු ලංකාවට</p>
            <div className="mt-3 text-xs text-orange-400 opacity-70">Go back to Sri Lanka</div>
          </button>

          {/* Option 3: Become a Citizen */}
          <button
            onClick={() => { setEndingChoice('citizen'); setScreen('ending'); }}
            className="group relative bg-gradient-to-br from-green-900/50 to-emerald-800/30 hover:from-green-800/70 hover:to-emerald-700/50 border-2 border-green-500/30 hover:border-green-400/60 rounded-2xl p-6 transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🛂</div>
            <h4 className="text-white font-black text-lg mb-2">Citizenship</h4>
            <p className="text-green-300 text-sm sinhala font-bold">පුරවැසියෙක් වෙන්න</p>
            <div className="mt-3 text-xs text-green-400 opacity-70">Get Australian passport</div>
          </button>
        </div>
      </div>

      {/* Alternative Actions */}
      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <button
          onClick={resetGame}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm hover:scale-105 shadow-xl transition-all border border-white/10"
        >
          <i className="fa-solid fa-repeat"></i> Play Again
        </button>
        <button
          onClick={() => setScreen('start')}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm hover:scale-105 shadow-xl transition-all border border-white/10"
        >
          <i className="fa-solid fa-home"></i> Main Menu
        </button>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-6 bg-slate-950 relative overflow-hidden">
      {/* Subtle professional background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(100,116,139,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[radial-gradient(circle_at_30%_100%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>
      </div>

      {/* Header */}
      <div className="w-full max-w-md relative z-10 mb-6 mt-4">
        <button onClick={() => setScreen('start')} className="text-slate-500 hover:text-slate-300 font-bold text-sm transition-all flex items-center gap-2 mb-4">
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-xl">
            <i className="fa-solid fa-passport text-2xl text-cyan-400"></i>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Create Profile</h1>
          <p className="text-slate-500 text-sm">Set up your immigrant character</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold mb-2 tracking-wider">
              <i className="fa-solid fa-user mr-2 text-cyan-500"></i>First Name
            </label>
            <input
              type="text"
              value={character.name}
              onChange={e => setCharacter({ ...character, name: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 hover:border-slate-600 p-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 font-bold text-white placeholder:text-slate-600 transition-all"
              placeholder="Enter your name"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-slate-500 font-bold mb-2 tracking-wider">
                <i className="fa-solid fa-calendar mr-2 text-purple-500"></i>Age
              </label>
              <input
                type="number"
                value={character.age}
                onChange={e => setCharacter({ ...character, age: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800/60 border border-slate-700 hover:border-slate-600 p-4 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 font-bold text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-500 font-bold mb-2 tracking-wider">
                <i className="fa-solid fa-venus-mars mr-2 text-pink-500"></i>Gender
              </label>
              <select
                value={character.gender}
                onChange={e => setCharacter({ ...character, gender: e.target.value as Gender })}
                className="w-full bg-slate-800/60 border border-slate-700 hover:border-slate-600 p-4 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 font-bold text-white appearance-none cursor-pointer transition-all"
              >
                <option value="Male">♂ Male</option>
                <option value="Female">♀ Female</option>
              </select>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold mb-2 tracking-wider">
              <i className="fa-solid fa-heart mr-2 text-red-500"></i>Relationship Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Single', 'Couple', 'With Kids'] as RelationshipStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setCharacter({ ...character, status: s })}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${character.status === s
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'}`}
                >
                  {s === 'Single' && '👤 '}
                  {s === 'Couple' && '👫 '}
                  {s === 'With Kids' && '👨‍👩‍👧 '}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 my-2"></div>

          {/* Game Mode Selection */}
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold mb-3 tracking-wider">
              <i className="fa-solid fa-gamepad mr-2 text-amber-500"></i>Story Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setUseAI(false);
                  localStorage.removeItem('mlife_gemini_key');
                  setGameSettings(prev => ({ ...prev, storyMode: 'predefined' }));
                }}
                className={`p-4 rounded-xl border text-center transition-all ${!useAI
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-600'}`}
              >
                <i className="fa-solid fa-book text-lg mb-2 block"></i>
                <span className="text-xs font-bold block">Classic Mode</span>
                <span className="text-[10px] text-slate-500 block mt-1">Pre-written stories</span>
              </button>
              <button
                onClick={() => {
                  setUseAI(true);
                  setShowApiSettings(true);
                  setGameSettings(prev => ({ ...prev, storyMode: 'ai-creative' }));
                }}
                className={`p-4 rounded-xl border text-center transition-all ${useAI
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                  : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-600'}`}
              >
                <i className="fa-solid fa-robot text-lg mb-2 block"></i>
                <span className="text-xs font-bold block">AI Creative</span>
                <span className="text-[10px] text-slate-500 block mt-1">Gemini-powered</span>
              </button>
            </div>

            {useAI && (
              <div className="mt-3 p-3 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className={`fa-solid ${apiKey ? 'fa-check-circle text-green-400' : 'fa-key text-purple-400'}`}></i>
                    <span className="text-xs text-slate-400">{apiKey ? 'API Key configured' : 'API Key required'}</span>
                  </div>
                  <button onClick={() => setShowApiSettings(true)} className="text-xs text-purple-400 hover:text-purple-300 font-bold">
                    {apiKey ? 'Change' : 'Setup'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          disabled={!character.name || character.name.length < 2 || (useAI && !apiKey)}
          onClick={() => setScreen('class-select')}
          className="w-full py-4 mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 disabled:grayscale rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2"
        >
          Continue <i className="fa-solid fa-arrow-right"></i>
        </button>

        {useAI && !apiKey && (
          <p className="text-xs text-center text-slate-500 mt-3">
            <i className="fa-solid fa-info-circle mr-1"></i>Enter API key to continue with AI mode
          </p>
        )}
      </div>

      {/* Step Indicator */}
      <div className="mt-6 flex items-center gap-2 relative z-10">
        <div className="w-8 h-1 bg-cyan-500 rounded-full"></div>
        <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
        <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
        <span className="ml-3 text-xs text-slate-600">Step 1 of 3</span>
      </div>

      {/* API Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 p-8 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-black mb-6 text-purple-300">
              <i className="fa-solid fa-robot mr-3"></i>Gemini API Key
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-2">Your Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl focus:outline-none focus:border-purple-500 font-mono text-sm"
                />
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-xs space-y-2">
                <p className="font-bold text-blue-300"><i className="fa-solid fa-lightbulb mr-2"></i>How to get API key:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 ml-2">
                  <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">aistudio.google.com/apikey</a></li>
                  <li>Create a free API key</li>
                  <li>Paste it above</li>
                </ol>
              </div>
              <button onClick={() => setShowPrivacyNotice(true)} className="text-xs text-slate-400 hover:text-slate-200 underline">
                <i className="fa-solid fa-shield-halved mr-1"></i>Privacy Notice
              </button>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              {/* Delete API Key Button */}
              {apiKey && (
                <button
                  onClick={() => {
                    if (confirm('Delete your API key from this browser? You can re-enter it anytime.')) {
                      localStorage.removeItem('mlife_gemini_key');
                      setApiKey('');
                      setUseAI(false);
                      setGameSettings(prev => ({ ...prev, storyMode: 'predefined', geminiApiKey: undefined }));
                      setShowApiSettings(false);
                      console.log('🗑️ API key deleted');
                    }
                  }}
                  className="w-full py-3 bg-red-900/30 hover:bg-red-800/50 border border-red-500/30 hover:border-red-400/50 rounded-xl font-bold text-red-400 hover:text-red-300 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-trash"></i> Delete API Key from Browser
                </button>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowApiSettings(false); if (!apiKey) setUseAI(false); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (apiKey.trim()) {
                      localStorage.setItem('mlife_gemini_key', apiKey.trim());
                      setGameSettings(prev => ({ ...prev, storyMode: 'ai-creative', geminiApiKey: apiKey.trim() }));
                      setShowApiSettings(false);
                      console.log('💾 API key saved, AI mode activated');
                    }
                  }}
                  disabled={!apiKey.trim()}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl font-bold text-white"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice Modal */}
      {showPrivacyNotice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-black mb-6">
              <i className="fa-solid fa-shield-halved mr-3 text-green-400"></i>Privacy Notice
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
                <p className="font-bold text-green-300 mb-2">Your Privacy is Protected</p>
                <p>We take your privacy seriously. Here's how your API key is handled:</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <i className="fa-solid fa-check text-green-400 mt-1"></i>
                  <div>
                    <p className="font-bold">Local Storage Only</p>
                    <p className="text-xs text-slate-400">Your API key is stored ONLY in your browser's local storage. It never leaves your device.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <i className="fa-solid fa-check text-green-400 mt-1"></i>
                  <div>
                    <p className="font-bold">No Server Storage</p>
                    <p className="text-xs text-slate-400">We do NOT send or store your API key on any server. All AI requests go directly from your browser to Google.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <i className="fa-solid fa-check text-green-400 mt-1"></i>
                  <div>
                    <p className="font-bold">You Have Control</p>
                    <p className="text-xs text-slate-400">You can remove your API key anytime by switching to pre-defined story mode.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <i className="fa-solid fa-check text-green-400 mt-1"></i>
                  <div>
                    <p className="font-bold">Google's Terms Apply</p>
                    <p className="text-xs text-slate-400">When using AI mode, your game prompts are sent to Google's Gemini API according to their <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">terms of service</a>.</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl">
                <p className="font-bold text-yellow-300 mb-2"><i className="fa-solid fa-exclamation-triangle mr-2"></i>Security Reminder</p>
                <p className="text-xs">Keep your API key private. Never share it publicly. You can set usage limits in your Google Cloud Console.</p>
              </div>
            </div>
            <button onClick={() => setShowPrivacyNotice(false)} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white">
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/40 overflow-x-hidden">
      <style>{`
        .bg-radial-vignette { background: radial-gradient(circle, transparent 20%, rgba(255, 0, 0, 0.3) 100%); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .mask-gradient-right { mask-image: linear-gradient(to right, black 85%, transparent 100%); }
        @keyframes float-up { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-100px); opacity: 0; } }
        .animate-float-up { animation: float-up 2s ease-out forwards; }
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        .animate-blob { animation: blob 15s infinite ease-in-out; }
        @keyframes shake { 0%, 100% { transform: translate(0,0); } 10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 0); } 20%, 40%, 60%, 80% { transform: translate(2px, 0); } }
        .shake-intense { animation: shake 0.5s infinite; }
        .animate-pulse-fast { animation: pulse 1s infinite; }
      `}</style>
      {screen === 'auth' && renderAuth()}
      {screen === 'start' && renderStart()}
      {screen === 'register' && renderRegister()}
      {screen === 'class-select' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in slide-in-from-right duration-500 bg-slate-950 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '-7s' }}></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          </div>
          <h2 className="text-4xl font-black mb-2 sinhala text-center tracking-tight bg-gradient-to-r from-orange-400 via-red-500 to-green-500 bg-clip-text text-transparent relative z-10">කොච්චර කට්ට කන්නද? 🔥</h2>
          <p className="text-slate-400 mb-8 text-center text-sm sinhala relative z-10">Melbourne වල struggle කරන level එක select කරන්න මචං 💀</p>
          <div className="grid gap-4 w-full max-w-md relative z-10">
            {(Object.keys(INITIAL_STATS) as ProfileClass[]).map(p => (
              <button key={p} onClick={() => startGame(p)} className="p-5 card-lift glass border border-white/10 rounded-2xl hover:border-blue-500/60 transition-all text-left group shadow-2xl relative overflow-hidden">
                <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-5 text-white transition-all duration-700">
                  <i className={`fa-solid ${p === 'ඇමති පුතා' ? 'fa-crown' : p === 'Business Family' ? 'fa-building' : p === 'Middle Class' ? 'fa-utensils' : 'fa-skull'}`}></i>
                </div>
                <div className="relative z-10">
                  {/* Title Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-white group-hover:text-blue-400 sinhala">{CLASS_DISPLAY[p].sinhala}</span>
                      <span className="text-slate-500 text-xs">|</span>
                      <span className="font-bold text-sm text-slate-300">{CLASS_DISPLAY[p].english}</span>
                    </div>
                    <span className="text-green-400 font-black text-sm">${INITIAL_STATS[p].money}</span>
                  </div>
                  {/* Subtitle - Roasting */}
                  <p className="text-slate-500 text-xs italic mb-2">"{CLASS_DISPLAY[p].subtitle}"</p>
                  {/* Difficulty Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${p === 'ඇමති පුතා' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                      p === 'Business Family' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30' :
                        p === 'Middle Class' ? 'bg-orange-900/50 text-orange-400 border border-orange-500/30' :
                          'bg-red-900/50 text-red-400 border border-red-500/30'
                      }`}>
                      {CLASS_DISPLAY[p].difficulty}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all text-sm"><i className="fa-solid fa-play"></i></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setScreen('start')} className="mt-10 text-slate-600 font-black hover:text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-3 relative z-10 transition-all hover:gap-4"><i className="fa-solid fa-arrow-left"></i> BACK TO MENU</button>
        </div>
      )}
      {screen === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-slate-950 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15)_0%,transparent_50%)]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          </div>
          {/* Enhanced dual-ring spinner */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-glow-pulse rounded-full"></div>
            {/* Outer ring */}
            <div className="w-32 h-32 border-4 border-white/5 border-t-blue-500 border-r-blue-400 rounded-full animate-spin relative z-10"></div>
            {/* Inner ring */}
            <div className="absolute top-4 left-4 w-24 h-24 border-4 border-white/5 border-b-cyan-500 border-l-cyan-400 rounded-full animate-spin-reverse"></div>
            {/* Center icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl z-20">✈️</div>
          </div>
          <h2 className="text-3xl font-black sinhala mb-3 text-white relative z-10 animate-fade-in-up">මෙල්බර්න් වලට ලෑන්ඩ් වෙනවා මචං...</h2>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] relative z-10"><span className="animate-pulse">Australia is calling...</span></p>
          {/* Loading progress bar */}
          <div className="w-48 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden relative z-10">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-shimmer" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}
      {screen === 'game' && renderGame()}
      {screen === 'gameover' && renderGameOver()}
      {screen === 'victory' && renderVictory()}
      {screen === 'ending' && renderEnding()}

      {/* Achievement Popup - Enhanced */}
      {showAchievement && (
        <div className="fixed top-20 right-4 md:right-8 z-[100] achievement-popup">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            {/* Card */}
            <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-2xl max-w-sm overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="text-5xl animate-bounce-subtle">{showAchievement.icon}</div>
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2">
                    <span className="animate-wiggle">🏆</span> Achievement Unlocked!
                  </h3>
                  <p className="font-bold text-sm mt-1">{showAchievement.title}</p>
                  <p className="text-xs text-white/80 mt-1">{showAchievement.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Random Event Modal */}
      {currentEvent && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-orange-500/50 rounded-3xl shadow-2xl overflow-hidden">
            {/* Event Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-center">
              <h2 className="text-3xl font-black text-white mb-2">{currentEvent.title}</h2>
              <p className="text-white/90 text-sm">⚡ Random Event!</p>
            </div>

            {/* Event Image */}
            <div className="relative w-full h-64 bg-slate-900">
              <img src={currentEvent.image} alt="Event" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>

            {/* Event Description */}
            <div className="p-6">
              <p className="text-white text-lg leading-relaxed mb-6 sinhala">{currentEvent.description}</p>

              {/* Auto-resolve event */}
              {currentEvent.autoResolve && (
                <button
                  onClick={resolveAutoEvent}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-black text-lg transition-all active:scale-95"
                >
                  ✓ Continue
                </button>
              )}

              {/* Event choices */}
              {currentEvent.choices && (
                <div className="space-y-3">
                  {currentEvent.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleEventChoice(index)}
                      className="w-full text-left p-4 bg-slate-800/60 hover:bg-slate-700/80 border-2 border-white/10 hover:border-orange-500/50 rounded-xl transition-all active:scale-98 group"
                    >
                      <p className="text-white font-bold sinhala">{choice.text}</p>
                      <div className="flex gap-3 mt-2 text-xs flex-wrap">
                        {choice.consequences.money && (
                          <span className={choice.consequences.money > 0 ? 'text-green-400' : 'text-red-400'}>
                            {choice.consequences.money > 0 ? '+' : ''}{choice.consequences.money}$
                          </span>
                        )}
                        {choice.consequences.stress && (
                          <span className={choice.consequences.stress > 0 ? 'text-red-400' : 'text-green-400'}>
                            {choice.consequences.stress > 0 ? '+' : ''}{choice.consequences.stress} Stress
                          </span>
                        )}
                        {choice.consequences.happiness && (
                          <span className={choice.consequences.happiness > 0 ? 'text-blue-400' : 'text-gray-400'}>
                            {choice.consequences.happiness > 0 ? '+' : ''}{choice.consequences.happiness} Happiness
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
