
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

  // Survival Progress logic: Target Day 30 for "PR/Settlement"
  const progressionPercent = useMemo(() => Math.min(Math.round(((stats.day - 1) / 30) * 100), 100), [stats.day]);

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

      // WIN CONDITIONS - Check before loss conditions!
      // Victory Condition 1: Reached Day 30 with good stats (Early Success)
      if (newStats.day >= 30 && newStats.money >= 3000 && newStats.stress < 70 && newStats.health >= 60) {
        setWinReason('🎉 30-Day Milestone! You\'ve established a stable life in Melbourne!');
        setScreen('victory');
        return;
      }
      
      // Victory Condition 2: Reached Day 60 (Settlement Progress)
      if (newStats.day >= 60 && newStats.money >= 5000 && newStats.health >= 50) {
        setWinReason('🏆 60-Day Achievement! You\'re well on your way to permanent residency!');
        setScreen('victory');
        return;
      }
      
      // Victory Condition 3: Reached Day 90 (PR Settlement Ready!) - Ultimate Win
      if (newStats.day >= 90) {
        setWinReason('🇦🇺 VICTORY! 90 Days Complete - PR Pathway Unlocked! You\'ve successfully settled in Melbourne!');
        setScreen('victory');
        return;
      }

      // GAME OVER CONDITIONS
      if (newStats.energy <= 0) {
        setWinReason('Burnout! Your energy depleted completely.');
        setScreen('gameover');
        return;
      }
      
      if (newStats.stress >= 100) {
        setWinReason('Mental breakdown! Stress became overwhelming.');
        setScreen('gameover');
        return;
      }
      
      if (newStats.health <= 0) {
        setWinReason('Health crisis! You need to return home for treatment.');
        setScreen('gameover');
        return;
      }

      // Visa expired without achieving settlement
      if (newStats.visaDaysLeft <= 0) {
        setWinReason('Visa expired! Time to go back to Sri Lanka.');
        setScreen('gameover');
        return;
      }
      
      // Bankruptcy - can't afford rent for 2 weeks
      if (newStats.money < 0 && newStats.weeklyRent > 0) {
        setWinReason('Bankruptcy! Unable to afford living expenses.');
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] animate-blob transition-colors duration-[2000ms] ${stats.stress > 70 ? 'bg-red-600' : stats.energy < 30 ? 'bg-yellow-600' : 'bg-blue-600'}`}></div>
        <div className={`absolute bottom-24 right-0 w-80 h-80 rounded-full blur-[100px] animate-blob transition-colors duration-[2000ms] ${stats.money < 100 ? 'bg-red-900' : 'bg-emerald-600'}`}></div>
      </div>

      {(stats.energy < 25 || stats.stress > 80) && <div className="pointer-events-none absolute inset-0 z-50 bg-radial-vignette opacity-40 animate-pulse-fast"></div>}

      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {statChanges.map((change) => (
          <div key={change.id} className={`${change.color} font-black text-xl sinhala animate-float-up drop-shadow-lg text-center`}>{change.text}</div>
        ))}
      </div>

      {/* STICKY HEADER WITH BREADCRUMBS & STATS */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        
        {/* Breadcrumb Navigation */}
        <div className="px-4 py-2 border-b border-white/5 bg-slate-950/50">
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-slate-500 flex items-center gap-1">
              <i className="fa-solid fa-home"></i> Melbourne
            </span>
            <i className="fa-solid fa-chevron-right text-slate-700 text-[8px]"></i>
            <span className="text-slate-500">Day {stats.day}</span>
            <i className="fa-solid fa-chevron-right text-slate-700 text-[8px]"></i>
            <span className={`px-2 py-0.5 rounded-full ${
              stats.day <= 7 ? 'bg-blue-500/20 text-blue-400' :
              stats.day <= 21 ? 'bg-purple-500/20 text-purple-400' :
              stats.day <= 60 ? 'bg-orange-500/20 text-orange-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {stats.day <= 7 ? '📦 Settling In' : 
               stats.day <= 21 ? '💼 Finding Work' : 
               stats.day <= 60 ? '🏠 Establishing Life' : 
               '🎯 Path to PR'}
            </span>
            <div className="flex-grow"></div>
            <span className={`px-2 py-0.5 rounded-full ${gameSettings.storyMode === 'ai-creative' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
              {gameSettings.storyMode === 'ai-creative' ? '🤖 AI Mode' : '📖 Story Mode'}
            </span>
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
            <button onClick={() => setShowInventory(!showInventory)} className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showInventory ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <i className="fa-solid fa-briefcase text-lg"></i>
              {inventory.length > 0 && !showInventory && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px] font-black text-white animate-bounce">{inventory.length}</span>
              )}
            </button>
            <button onClick={handleLogout} className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all">
              <i className="fa-solid fa-sign-out-alt text-lg"></i>
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
            <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
              stats.visaDaysLeft < 14 ? 'bg-gradient-to-br from-red-950/80 to-red-900/60 border-2 border-red-500/40 animate-pulse' : 
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

        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 via-red-500 to-green-500 group-hover:h-1/2 transition-all duration-500"></div>
          <p className="sinhala text-xl leading-relaxed text-slate-100 font-medium"><TypewriterText text={currentScene?.story_text || ""} /></p>
        </div>

        {/* Choices with enhanced styling */}
        <div className="grid gap-3">
          {currentScene?.choices.map((choice, idx) => {
             const hasRequired = !choice.required_item || inventory.includes(choice.required_item);
             return (
              <button key={choice.id} disabled={isProcessing || !hasRequired} onClick={() => handleChoice(choice)} className={`sinhala text-left p-5 rounded-[1.5rem] border transition-all transform active:scale-[0.98] group relative overflow-hidden
                  ${!hasRequired ? 'opacity-40 grayscale cursor-not-allowed bg-slate-900/30' : isProcessing ? 'opacity-50 cursor-wait' : 'bg-gradient-to-r from-slate-900/80 to-slate-800/60 border-white/5 hover:border-blue-500/40 hover:from-slate-800/90 hover:to-slate-700/70 shadow-lg hover:shadow-blue-500/10'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                <div className="flex items-start gap-5 relative z-10">
                  <span className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center font-black shrink-0 mt-0.5 text-lg ${
                    choice.is_risky 
                      ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white border-2 border-orange-400/50' 
                      : 'bg-slate-800 text-slate-500 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white'
                  }`}>
                    {choice.is_risky ? <i className="fa-solid fa-skull"></i> : idx + 1}
                  </span>
                  <div className="flex flex-col flex-grow">
                    <span className="text-lg font-bold leading-tight group-hover:text-white transition-colors">{choice.text}</span>
                    {choice.required_item && (
                      <span className={`text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${hasRequired ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                        <i className={`fa-solid ${hasRequired ? 'fa-check-circle' : 'fa-lock'} text-[10px]`}></i> 
                        {hasRequired ? 'Has' : 'Needs'}: {choice.required_item}
                      </span>
                    )}
                    {choice.is_risky && (
                      <span className="text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2 px-3 py-1 rounded-lg w-fit bg-orange-500/20 text-orange-400">
                        <i className="fa-solid fa-triangle-exclamation"></i> RISKY CHOICE
                      </span>
                    )}
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 overflow-hidden relative">
      {/* Sri Lankan Flag Colors Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-amber-600 to-orange-500 blur-3xl"></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-r from-red-900 to-red-700 blur-3xl"></div>
        <div className="absolute top-2/3 left-0 w-full h-1/3 bg-gradient-to-r from-green-800 to-green-600 blur-3xl"></div>
      </div>
      
      <div className="mb-12 relative animate-in fade-in zoom-in duration-1000 z-10">
        <div className="absolute -inset-20 bg-gradient-to-r from-orange-500/20 via-red-700/20 to-green-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-6xl animate-bounce" style={{animationDelay: '0ms'}}>🇱🇰</span>
          <i className="fa-solid fa-plane text-5xl text-blue-400 animate-pulse"></i>
          <span className="text-6xl animate-bounce" style={{animationDelay: '500ms'}}>🇦🇺</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black mb-3 tracking-tighter bg-gradient-to-r from-orange-500 via-red-600 to-green-600 bg-clip-text text-transparent relative z-10 drop-shadow-2xl">MELBOURNE<br/>LIFE</h1>
        <p className="text-3xl sinhala font-black bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent relative z-10">මෙල්බර්න් ජීවිතය</p>
        <p className="text-slate-400 text-xs mt-2 font-bold tracking-wider">🎮 Immigration Survival Simulator</p>
      </div>
      
      <div className="w-full max-w-sm bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/10 p-10 rounded-[3rem] shadow-2xl relative z-20 backdrop-blur-xl">
        <p className="sinhala font-bold mb-8 text-slate-300 text-lg">ගමන පටන් ගන්න ඉස්සෙල්ලා ලොග් වෙලා ඉමු මචං! 🚀</p>
        <button onClick={handleGoogleLogin} className="group w-full flex items-center justify-center gap-4 bg-gradient-to-r from-white to-slate-100 text-slate-950 py-6 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl hover:shadow-orange-500/30">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-7 h-7" alt="G" /> Login with Google
        </button>
        <div className="mt-8 flex flex-col gap-4">
           <button onClick={() => setScreen('start')} className="w-full py-5 bg-gradient-to-r from-slate-800 to-slate-700 text-slate-200 rounded-3xl font-black hover:scale-105 transition-all flex items-center justify-center gap-2 border border-white/5 shadow-xl">
             <i className="fa-solid fa-user-secret"></i> Play as Guest
           </button>
           <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
             <i className="fa-solid fa-info-circle mr-1"></i>
             Guest saves stored locally only
           </p>
        </div>
      </div>
    </div>
  );

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 relative overflow-hidden">
      {/* Sri Lankan Flag Colors Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-amber-600 to-orange-500 blur-3xl"></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-r from-red-900 to-red-700 blur-3xl"></div>
        <div className="absolute top-2/3 left-0 w-full h-1/3 bg-gradient-to-r from-green-800 to-green-600 blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="mb-12 relative z-10">
         <div className="absolute -inset-10 bg-gradient-to-r from-orange-500/30 via-red-700/30 to-green-600/30 blur-[100px] rounded-full animate-pulse"></div>
         <div className="flex items-center justify-center gap-4 mb-4">
           <span className="text-5xl">🇱🇰</span>
           <i className="fa-solid fa-plane text-4xl text-blue-400 animate-bounce"></i>
           <span className="text-5xl">🇦🇺</span>
         </div>
         <h1 className="text-7xl md:text-8xl font-black mb-3 tracking-tighter bg-gradient-to-r from-orange-500 via-red-600 to-green-600 bg-clip-text text-transparent relative z-10 drop-shadow-2xl">MELBOURNE LIFE</h1>
         <p className="text-4xl sinhala font-black bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent relative z-10">මෙල්බර්න් ජීවිතය</p>
         <p className="text-slate-400 text-sm mt-3 font-bold tracking-wider">Sri Lankan Immigration Simulator</p>
      </div>

      {/* How to Play Section */}
      <div className="w-full max-w-2xl mb-8 relative z-10">
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-xl font-black text-amber-400 mb-4 flex items-center justify-center gap-2">
            <i className="fa-solid fa-gamepad"></i> HOW TO PLAY
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-user text-orange-400"></i>
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-1">Create Character</p>
                <p className="text-slate-400 text-xs">Choose your background and class</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-book-open text-red-400"></i>
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-1">Make Choices</p>
                <p className="text-slate-400 text-xs">Navigate life in Melbourne wisely</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-trophy text-green-400"></i>
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-1">Survive & Thrive</p>
                <p className="text-slate-400 text-xs">Reach 30 days for PR settlement!</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-slate-500 text-center">
              <i className="fa-solid fa-info-circle mr-1"></i>
              Manage money, stress, energy & health • Complete 90 visa days • Find work, housing & friends
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 animate-in fade-in duration-700 w-full max-w-sm relative z-10">
        <div className="bg-gradient-to-r from-slate-900/60 via-red-900/40 to-slate-900/60 px-8 py-4 rounded-full border border-white/10 backdrop-blur-md text-slate-300 font-bold flex items-center justify-center gap-3 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> 
            {session ? session.user.user_metadata?.full_name?.split(' ')[0] : 'Guest Mode'}
        </div>
        
        {hasExistingSave && (
          <button onClick={loadGame} className="w-full py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-[2.5rem] font-black text-2xl hover:scale-105 shadow-2xl flex items-center justify-center gap-4 transition-all hover:shadow-emerald-500/50">
            <i className="fa-solid fa-play"></i> CONTINUE JOURNEY
          </button>
        )}

        <button onClick={() => setScreen('register')} className="w-full py-6 bg-gradient-to-r from-orange-500 via-red-600 to-green-600 text-white rounded-[2.5rem] font-black text-2xl hover:scale-105 shadow-2xl transition-all hover:shadow-orange-500/50">
           <i className="fa-solid fa-plane-departure mr-2"></i>{hasExistingSave ? 'NEW JOURNEY' : "START ADVENTURE 🇦🇺"}
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
          }} className="text-red-500 font-black hover:text-red-400 transition-colors uppercase tracking-widest text-xs mt-2 hover:scale-105">
            <i className="fa-solid fa-trash mr-2"></i>DELETE SAVED GAME
          </button>
        )}
        
        {session && <button onClick={handleLogout} className="text-slate-600 font-black hover:text-red-500 transition-colors uppercase tracking-widest text-xs mt-4">LOGOUT</button>}
        {!session && <button onClick={() => setScreen('auth')} className="text-slate-600 font-black hover:text-blue-500 transition-colors uppercase tracking-widest text-xs mt-4">BACK TO LOGIN</button>}
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
            <span key={i} className="animate-bounce" style={{animationDelay: `${i * 200}ms`}}>{emoji}</span>
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
         <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-r from-green-600 to-emerald-500 blur-3xl animate-pulse" style={{animationDelay: '500ms'}}></div>
         <div className="absolute top-2/3 left-0 w-full h-1/3 bg-gradient-to-r from-blue-600 to-purple-500 blur-3xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-6 animate-in zoom-in duration-500 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 relative overflow-hidden">
      {/* Sri Lankan Flag Colors Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-amber-600 to-orange-500 blur-3xl"></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-r from-red-900 to-red-700 blur-3xl"></div>
        <div className="absolute top-2/3 left-0 w-full h-1/3 bg-gradient-to-r from-green-800 to-green-600 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/10 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative backdrop-blur-xl z-10 touch-manipulation">
        {/* Mobile Improvement #1: Larger touch-friendly icon */}
        <div className="absolute -top-12 md:-top-14 left-1/2 -translate-x-1/2 w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-orange-500 via-red-600 to-green-600 rounded-full border-4 md:border-8 border-slate-950 flex items-center justify-center text-4xl md:text-5xl shadow-2xl text-white animate-bounce" style={{animationDuration: '2s'}}><i className="fa-solid fa-passport"></i></div>
        <h2 className="text-3xl md:text-4xl font-black mb-6 md:mb-10 sinhala text-center pt-8 md:pt-10 tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">ප්‍රොෆයිල් එක (Profile)</h2>
        {/* Mobile Improvement #2: Optimized spacing and touch targets (min 44px) */}
        <div className="space-y-5 md:space-y-8">
          <div>
            <label className="block text-[11px] uppercase text-slate-400 font-black mb-3 tracking-widest sinhala flex items-center gap-2">
              <i className="fa-solid fa-user text-orange-500"></i>නම (First Name)
            </label>
            <input 
              type="text" 
              value={character.name} 
              onChange={e => setCharacter({...character, name: e.target.value})} 
              className="w-full bg-slate-800/60 border-2 border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-black text-base md:text-lg placeholder:text-slate-600 transition-all touch-manipulation" 
              placeholder="Ex: Pathum" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[11px] uppercase text-slate-400 font-black mb-3 tracking-widest sinhala flex items-center gap-2">
                <i className="fa-solid fa-calendar text-red-500"></i>වයස (Age)
              </label>
              <input 
                type="number" 
                value={character.age} 
                onChange={e => setCharacter({...character, age: parseInt(e.target.value) || 0})} 
                className="w-full bg-slate-800/60 border-2 border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-black text-base md:text-lg transition-all touch-manipulation" 
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-slate-400 font-black mb-3 tracking-widest sinhala flex items-center gap-2">
                <i className="fa-solid fa-venus-mars text-green-500"></i>Gender
              </label>
              <select 
                value={character.gender} 
                onChange={e => setCharacter({...character, gender: e.target.value as Gender})} 
                className="w-full bg-slate-800/60 border-2 border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-black text-base md:text-lg appearance-none cursor-pointer transition-all touch-manipulation"
              >
                <option value="Male">♂ Male</option>
                <option value="Female">♀ Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-slate-400 font-black mb-3 tracking-widest sinhala flex items-center gap-2">
              <i className="fa-solid fa-heart text-pink-500"></i>Status
            </label>
            {/* Mobile Improvement #3: Larger tap targets with visual feedback */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {(['Single', 'Couple', 'With Kids'] as RelationshipStatus[]).map(s => (
                <button 
                  key={s} 
                  onClick={() => setCharacter({...character, status: s})} 
                  className={`py-4 md:py-5 rounded-2xl md:rounded-3xl border-2 text-[9px] md:text-[10px] font-black transition-all active:scale-95 touch-manipulation ${character.status === s ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-400 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-800/40 border-white/10 text-slate-500 hover:border-white/20'}`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {/* AI Mode Toggle - Mobile Improvement #4: Visual feedback on tap */}
          <div className="border-t border-white/10 pt-5 md:pt-6">
            <label className="block text-[11px] uppercase text-slate-400 font-black mb-3 tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-palette text-blue-500"></i>Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { 
                  setUseAI(false); 
                  localStorage.removeItem('mlife_gemini_key'); 
                  setGameSettings(prev => ({ ...prev, storyMode: 'predefined' }));
                  console.log('🔧 Switched to PREDEFINED mode');
                }} 
                className={`py-4 md:py-5 rounded-2xl md:rounded-3xl border-2 text-[9px] md:text-[10px] font-black transition-all active:scale-95 touch-manipulation ${!useAI ? 'bg-gradient-to-br from-green-600 to-green-700 border-green-400 text-white shadow-lg shadow-green-500/30' : 'bg-slate-800/40 border-white/10 text-slate-500 hover:border-white/20'}`}
              >
                <i className="fa-solid fa-book mr-1 md:mr-2"></i>PRE-DEFINED<br className="md:hidden" /><span className="hidden md:inline"> </span>STORIES
              </button>
              <button 
                onClick={() => { 
                  setUseAI(true); 
                  setShowApiSettings(true); 
                  setGameSettings(prev => ({ ...prev, storyMode: 'ai-creative' }));
                  console.log('🤖 Switched to AI CREATIVE mode');
                }} 
                className={`py-4 md:py-5 rounded-2xl md:rounded-3xl border-2 text-[9px] md:text-[10px] font-black transition-all active:scale-95 touch-manipulation ${useAI ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-purple-400 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800/40 border-white/10 text-slate-500 hover:border-white/20'}`}
              >
                <i className="fa-solid fa-robot mr-1 md:mr-2"></i>AI CREATIVE<br className="md:hidden" /><span className="hidden md:inline"> </span>MODE
              </button>
            </div>
            {useAI && (
              <div className="mt-4 space-y-3">
                <div className="bg-purple-900/20 border border-purple-500/20 p-4 rounded-2xl text-xs">
                  <i className="fa-solid fa-info-circle mr-2 text-purple-400"></i>
                  <span className="text-slate-300">AI mode uses Gemini API for unlimited creative scenarios</span>
                </div>
                <button onClick={() => setShowApiSettings(true)} className="w-full py-4 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 rounded-2xl font-bold text-sm text-purple-300 transition-all">
                  <i className="fa-solid fa-key mr-2"></i>{apiKey ? 'Update API Key' : 'Enter API Key'}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Improvement #5: Fixed bottom button on mobile for easy thumb access */}
          <button 
            disabled={!character.name || character.name.length < 2 || (useAI && !apiKey)} 
            onClick={() => setScreen('class-select')} 
            className="w-full py-5 md:py-7 bg-gradient-to-r from-orange-600 via-red-600 to-green-600 hover:from-orange-500 hover:via-red-500 hover:to-green-500 disabled:opacity-20 disabled:grayscale rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl shadow-2xl text-white transition-all active:scale-95 touch-manipulation mt-6"
          >
            <i className="fa-solid fa-arrow-right mr-2"></i>
            {useAI && !apiKey ? 'ENTER API KEY FIRST' : 'NEXT: PICK SOCIAL CLASS'}
          </button>
          
          <button 
            onClick={() => setScreen('start')} 
            className="w-full mt-4 text-slate-500 hover:text-slate-300 font-bold text-sm transition-all active:scale-95 touch-manipulation"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>Back to Start
          </button>
        </div>
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
            <div className="flex gap-3 mt-6">
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
         <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in slide-in-from-right duration-500 bg-slate-950">
          <h2 className="text-4xl font-black mb-4 sinhala text-center tracking-tight">ජීවන තත්වය (Class)</h2>
          <p className="text-slate-400 mb-14 text-center text-sm">Choose your difficulty mode 🎮</p>
          <div className="grid gap-5 w-full max-w-sm">
            {(Object.keys(INITIAL_STATS) as ProfileClass[]).map(p => (
              <button key={p} onClick={() => startGame(p)} className="p-8 bg-slate-900/60 border border-white/10 rounded-[2.5rem] hover:border-blue-500/60 transition-all text-left group hover:scale-[1.03] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-5 text-white transition-all duration-700">
                   <i className={`fa-solid ${p === 'ඇමති පුතා' ? 'fa-crown' : p === 'Business Family' ? 'fa-building' : p === 'Middle Class' ? 'fa-graduation-cap' : 'fa-handshake'}`}></i>
                </div>
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-black text-2xl text-white group-hover:text-blue-400 uppercase tracking-tight">{p}</span>
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        p === 'ඇමති පුතා' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                        p === 'Business Family' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30' :
                        p === 'Middle Class' ? 'bg-orange-900/50 text-orange-400 border border-orange-500/30' :
                        'bg-red-900/50 text-red-400 border border-red-500/30'
                      }`}>
                        {p === 'ඇමති පුතා' ? '🎮 EASY' : p === 'Business Family' ? '⚖️ MODERATE' : p === 'Middle Class' ? '🔥 HARD' : '💀 SURVIVAL'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 sinhala font-black uppercase tracking-widest flex items-center gap-2">
                       <i className="fa-solid fa-wallet text-slate-600"></i> Starting with ${INITIAL_STATS[p].money}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all"><i className="fa-solid fa-arrow-right"></i></div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setScreen('start')} className="mt-14 text-slate-600 font-black hover:text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-3"><i className="fa-solid fa-arrow-left"></i> BACK</button>
        </div>
      )}
      {screen === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-slate-950">
          <div className="relative"><div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full"></div><div className="w-28 h-28 border-8 border-white/5 border-t-blue-500 rounded-full animate-spin mb-12 relative z-10"></div></div>
          <h2 className="text-3xl font-black sinhala mb-3 text-white">මෙල්බර්න් වලට ලෑන්ඩ් වෙනවා මචං...</h2>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Australia is calling...</p>
        </div>
      )}
      {screen === 'game' && renderGame()}
      {screen === 'gameover' && renderGameOver()}
      {screen === 'victory' && renderVictory()}
      {screen === 'ending' && renderEnding()}
      
      {/* Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-20 right-4 md:right-8 z-[100] animate-in slide-in-from-right duration-500">
          <div className={`bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-2xl max-w-sm`}>
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-bounce">{showAchievement.icon}</div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight">🏆 Achievement Unlocked!</h3>
                <p className="font-bold text-sm mt-1">{showAchievement.title}</p>
                <p className="text-xs text-white/80 mt-1">{showAchievement.description}</p>
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
