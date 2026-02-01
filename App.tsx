
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getNextStep, generateSceneImage } from './scenarioEngine';
import { generateScene } from './geminiService';
import { ProfileClass, GameStats, GameResponse, Choice, StoryLog, CharacterProfile, Gender, RelationshipStatus, GameState } from './types';
import { StatBar } from './components/StatBar';

// Supabase Initialization - No more API keys needed!
const supabaseUrl = 'https://mggcjyfnagjttezrqdwx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZ2NqeWZuYWdqdHRlenJxZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzcwMDYsImV4cCI6MjA4NTUxMzAwNn0.jgmYz6jpp3jJltJC0GlTkB0x0zEf93zkr5GYv1iuPus';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const INITIAL_STATS: Record<ProfileClass, GameStats> = {
  "ඇමති පුතා": { money: 25000, stress: 0, energy: 100, day: 1, health: 100, visaDaysLeft: 90, weeklyRent: 0, lastRentDay: 1, consecutiveWorkDays: 0 },
  "Business Family": { money: 8000, stress: 10, energy: 100, day: 1, health: 100, visaDaysLeft: 90, weeklyRent: 300, lastRentDay: 1, consecutiveWorkDays: 0 },
  "Middle Class": { money: 3000, stress: 30, energy: 90, day: 1, health: 90, visaDaysLeft: 90, weeklyRent: 200, lastRentDay: 1, consecutiveWorkDays: 0 },
  "Lower Class": { money: 1000, stress: 60, energy: 80, day: 1, health: 80, visaDaysLeft: 90, weeklyRent: 150, lastRentDay: 1, consecutiveWorkDays: 0 }
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
  const [screen, setScreen] = useState<'auth' | 'start' | 'register' | 'class-select' | 'loading' | 'game' | 'gameover'>('auth');
  const [character, setCharacter] = useState<Partial<CharacterProfile>>({
    name: '', age: 22, gender: 'Male', status: 'Single'
  });
  const [profileClass, setProfileClass] = useState<ProfileClass | null>(null);
  const [stats, setStats] = useState<GameStats>({ money: 0, stress: 0, energy: 0, day: 1, health: 100, visaDaysLeft: 90, weeklyRent: 0, lastRentDay: 1, consecutiveWorkDays: 0 });
  const [inventory, setInventory] = useState<string[]>([]);
  const [currentScene, setCurrentScene] = useState<GameResponse | null>(null);
  const [sceneImage, setSceneImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<StoryLog[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingSave, setHasExistingSave] = useState(false);
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
      currentScene: updatedScene
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
      
      setScreen('loading');
      if (savedState.currentScene) {
        const img = await generateSceneImage(savedState.currentScene.image_prompt);
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
    const fullProfile = { ...character, class: selectedClass } as CharacterProfile;
    setProfileClass(selectedClass);
    setStats(INITIAL_STATS[selectedClass]);
    setInventory([]);
    setHistory([]);
    setScreen('loading');
    
    try {
      const initialScene = await getNextStep(fullProfile, "Arrival at Melbourne Airport", [], []);
      setCurrentScene(initialScene);
      const img = await generateSceneImage(initialScene.image_prompt);
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
      if (useAI && apiKey) {
        const contextSummary = updatedHistory.map(h => h.summary).join(' ');
        nextScene = await generateScene(contextSummary, choice.text, fullProfile, stats, inventory);
      } else {
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
        consecutiveWorkDays: newConsecutiveWorkDays
      };
      
      setStats(newStats);

      let updatedInventory = inventory;
      if (nextScene.new_items && nextScene.new_items.length > 0) {
        updatedInventory = Array.from(new Set([...inventory, ...nextScene.new_items!]));
        setInventory(updatedInventory);
      }

      // Game over conditions
      if (newStats.energy <= 0 || newStats.stress >= 100 || newStats.health <= 0) {
        setScreen('gameover');
        return;
      }

      // Visa expired
      if (newStats.visaDaysLeft <= 0) {
        setScreen('gameover');
        return;
      }

      // Eviction if can't pay rent for 2 weeks
      if (rentDeduction > 0 && newStats.money < stats.weeklyRent) {
        // Trigger eviction scenario if it exists, otherwise continue
      }

      setCurrentScene(nextScene);
      setSceneImage(null);
      const img = await generateSceneImage(nextScene.image_prompt);
      setSceneImage(img);

      // Auto-save after every move
      saveGame(newStats, updatedInventory, updatedHistory, nextScene);
    } catch (e: any) { 
      console.error("Error processing choice:", e);
    } finally {
      setIsProcessing(false);
    }
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
      consecutiveWorkDays: 0
    });
    setInventory([]);
    setHistory([]);
    setHasExistingSave(false);
    setCharacter({ name: '', age: 22, gender: 'Male', status: 'Single' });
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

      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-4 shadow-xl">
        {/* Progression Bar */}
        <div className="mb-4">
           <div className="flex justify-between items-center mb-1">
             <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Migration Journey</span>
             <span className="text-[10px] font-black text-slate-500">{progressionPercent}% Settled</span>
           </div>
           <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
             <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${progressionPercent}%` }} />
           </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3 group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white border-2 transition-all duration-500 group-hover:rotate-6 ${character.gender === 'Female' ? 'bg-pink-600 border-pink-400' : 'bg-blue-600 border-blue-400'}`}>
              <i className={`fa-solid ${character.gender === 'Female' ? 'fa-person-dress' : 'fa-person'} text-xl`}></i>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest leading-none">{character.name}</p>
                {isSaving && <span className="text-[8px] font-bold text-emerald-500 animate-pulse uppercase">Saving...</span>}
              </div>
              <p className="text-base font-black text-white leading-tight uppercase tracking-tight">{profileClass}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowInventory(!showInventory)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${showInventory ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}>
              <i className="fa-solid fa-briefcase"></i>
              {inventory.length > 0 && !showInventory && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full animate-bounce"></span>}
            </button>
            <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all">
              <i className="fa-solid fa-sign-out-alt"></i>
            </button>
            <div className="bg-slate-800/50 px-3 py-1 rounded-xl border border-white/5 flex flex-col items-center min-w-[48px]">
              <span className="text-[9px] text-slate-500 font-black uppercase leading-none mt-0.5">Day</span>
              <span className="text-sm font-black text-blue-400 leading-none">{stats.day}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatBar label="සල්ලි" value={stats.money} max={10000} icon="fa-solid fa-wallet" color="text-green-400" />
          <StatBar label="Stress" value={stats.stress} max={100} icon="fa-solid fa-brain" color="text-red-400" />
          <StatBar label="පණ" value={stats.energy} max={100} icon="fa-solid fa-bolt-lightning" color="text-blue-400" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <StatBar label="Health" value={stats.health} max={100} icon="fa-solid fa-heart-pulse" color="text-pink-400" />
          <div className="bg-slate-800/50 px-3 py-2 rounded-xl border border-white/5 flex flex-col">
            <span className="text-[9px] text-slate-500 font-black uppercase leading-none">Visa Days</span>
            <span className={`text-sm font-black leading-none mt-1 ${stats.visaDaysLeft < 30 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>{stats.visaDaysLeft} days</span>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 space-y-6 pb-28 overflow-y-auto custom-scrollbar relative z-10">
        <div className="relative w-full aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
          {sceneImage ? (
            <img 
              src={sceneImage} 
              alt="Scene illustration" 
              className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${stats.stress > 80 ? 'saturate-[1.5] contrast-[1.2]' : ''}`}
              loading="lazy"
              onError={(e) => {
                // Fallback to a default Melbourne image if comic generation fails
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1024&h=768&fit=crop';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 animate-pulse">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Generating Comic Scene...</p>
            </div>
          )}
          {isProcessing && <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-20"><div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div></div>}
        </div>

        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:h-1/2 transition-all duration-500"></div>
          <p className="sinhala text-xl leading-relaxed text-slate-100 font-medium"><TypewriterText text={currentScene?.story_text || ""} /></p>
        </div>

        <div className="grid gap-3">
          {currentScene?.choices.map((choice, idx) => {
             const hasRequired = !choice.required_item || inventory.includes(choice.required_item);
             return (
              <button key={choice.id} disabled={isProcessing || !hasRequired} onClick={() => handleChoice(choice)} className={`sinhala text-left p-5 rounded-[1.5rem] border transition-all transform active:scale-[0.98] group relative overflow-hidden
                  ${!hasRequired ? 'opacity-40 grayscale cursor-not-allowed' : isProcessing ? 'opacity-50 cursor-wait' : 'bg-slate-900/60 border-white/5 hover:border-blue-500/40 hover:bg-slate-800/80 shadow-lg'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                <div className="flex items-start gap-5 relative z-10">
                  <span className={`w-10 h-10 rounded-xl bg-slate-800 transition-all flex items-center justify-center text-slate-500 group-hover:bg-blue-500 group-hover:text-white font-black shrink-0 mt-0.5 ${choice.is_risky ? 'border-orange-500/40' : ''}`}>
                    {choice.is_risky ? <i className="fa-solid fa-skull text-sm"></i> : idx + 1}
                  </span>
                  <div className="flex flex-col flex-grow">
                    <span className="text-lg font-bold leading-tight group-hover:text-white transition-colors">{choice.text}</span>
                    {choice.required_item && (
                      <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2 ${hasRequired ? 'text-blue-400' : 'text-red-500'}`}>
                        <i className={`fa-solid ${hasRequired ? 'fa-check' : 'fa-lock'} text-[8px]`}></i> Needs: {choice.required_item}
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
        <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl p-4 pt-24 animate-in fade-in duration-300 flex items-center justify-center">
          <div className="bg-slate-900/95 border border-white/10 rounded-[3rem] p-6 shadow-2xl w-full max-w-lg h-[85vh] flex flex-col relative overflow-hidden">
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-center mb-6 relative z-10 px-2">
              <h3 className="text-3xl font-black sinhala flex items-center gap-4 text-white">
                <i className="fa-solid fa-box-open text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"></i> මගේ බඩු
              </h3>
              <button onClick={() => { setShowInventory(false); setInventorySearch(""); }} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="relative z-10 space-y-3 mb-6 px-2">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input type="text" placeholder="බඩු හොයන්න..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} className="w-full bg-slate-800/50 border border-white/5 p-4 pl-12 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-sm sinhala placeholder:opacity-50" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mask-gradient-right">
                {(['All', 'Essentials', 'Transport', 'Work', 'Documents'] as const).map(cat => (
                  <button key={cat} onClick={() => setInventoryCategory(cat)} className={`whitespace-nowrap py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${inventoryCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setInventorySort('newest')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inventorySort === 'newest' ? 'bg-slate-100 text-slate-900 shadow-md' : 'bg-slate-800 text-slate-500'}`}><i className="fa-solid fa-clock-rotate-left mr-2"></i> Newest</button>
                <button onClick={() => setInventorySort('alphabetical')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inventorySort === 'alphabetical' ? 'bg-slate-100 text-slate-900 shadow-md' : 'bg-slate-800 text-slate-500'}`}><i className="fa-solid fa-sort-alpha-down mr-2"></i> A-Z</button>
              </div>
            </div>
            <div className="flex-grow grid grid-cols-2 gap-4 overflow-y-auto pr-2 px-2 custom-scrollbar relative z-10 pb-6">
              {processedInventory.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 opacity-30 text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4"><i className="fa-solid fa-ghost text-4xl"></i></div>
                  <p className="sinhala text-xl font-black uppercase tracking-tighter">මුකුත් නෑ මචං</p>
                </div>
              ) : (
                processedInventory.map((item, idx) => {
                  const meta = getItemMetadata(item);
                  return (
                    <div key={idx} className="bg-slate-800/40 p-4 rounded-3xl border border-white/5 flex flex-col gap-3 hover:bg-slate-800 hover:border-blue-500/30 transition-all group animate-in zoom-in duration-300 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-[7px] font-black uppercase tracking-tighter opacity-30">{meta.category}</div>
                      <div className={`w-12 h-12 rounded-2xl ${meta.color}/10 flex items-center justify-center ${meta.color.replace('bg-', 'text-')} group-hover:scale-110 group-hover:${meta.color} group-hover:text-white transition-all shadow-xl`}>
                        <i className={`fa-solid ${meta.icon} text-lg`}></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="leading-tight text-slate-200 text-sm font-black sinhala">{item}</span>
                        <div className="w-4 h-1 bg-white/10 rounded-full mt-2 group-hover:w-8 group-hover:bg-blue-500 transition-all"></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAuth = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]"></div>
      <div className="mb-16 relative animate-in fade-in zoom-in duration-1000">
        <div className="absolute -inset-20 bg-blue-600/20 blur-[120px] rounded-full animate-blob"></div>
        <h1 className="text-7xl font-black mb-3 tracking-tighter text-white relative z-10">MELBOURNE<br/>LIFE</h1>
        <p className="text-3xl sinhala font-black text-blue-500 relative z-10">මෙල්බර්න් ලයිෆ්</p>
      </div>
      <div className="w-full max-w-sm bg-slate-900/60 border border-white/10 p-10 rounded-[3rem] shadow-2xl relative z-20 backdrop-blur-xl">
        <p className="sinhala font-bold mb-8 text-slate-400 text-lg">ගමන පටන් ගන්න ඉස්සෙල්ලා ලොග් වෙලා ඉමු මචං.</p>
        <button onClick={handleGoogleLogin} className="group w-full flex items-center justify-center gap-4 bg-white text-slate-950 py-6 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-7 h-7" alt="G" /> Login with Google
        </button>
        <div className="mt-10 flex flex-col gap-4">
           <button onClick={() => setScreen('start')} className="w-full py-4 bg-slate-800 text-slate-300 rounded-3xl font-black hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
             <i className="fa-solid fa-user-secret"></i> Play as Guest
           </button>
           <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">Guest saves are only stored on this device.</p>
        </div>
      </div>
    </div>
  );

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950">
      <div className="mb-16 relative">
         <div className="absolute -inset-10 bg-blue-500/30 blur-[100px] rounded-full"></div>
         <h1 className="text-8xl font-black mb-2 tracking-tighter bg-gradient-to-br from-white to-slate-600 bg-clip-text text-transparent relative z-10">MLIFE</h1>
         <p className="text-4xl sinhala font-black text-blue-500 relative z-10">මෙල්බර්න් ලයිෆ්</p>
      </div>
      <div className="flex flex-col gap-6 animate-in fade-in duration-700 w-full max-w-xs">
        <div className="bg-slate-900/60 px-8 py-4 rounded-full border border-white/5 backdrop-blur-md text-slate-300 font-bold flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> 
            {session ? session.user.user_metadata?.full_name?.split(' ')[0] : 'Guest Mode'}
        </div>
        
        {hasExistingSave && (
          <button onClick={loadGame} className="w-full py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl hover:scale-105 shadow-xl flex items-center justify-center gap-4 transition-all">
            <i className="fa-solid fa-play"></i> CONTINUE
          </button>
        )}

        <button onClick={() => setScreen('register')} className="w-full py-6 bg-white text-slate-950 rounded-[2.5rem] font-black text-2xl hover:scale-105 shadow-xl transition-all">
           {hasExistingSave ? 'NEW JOURNEY' : "LET'S FLY 🇦🇺"}
        </button>
        
        {session && <button onClick={handleLogout} className="text-slate-600 font-black hover:text-red-500 transition-colors uppercase tracking-widest text-xs mt-4">LOGOUT</button>}
        {!session && <button onClick={() => setScreen('auth')} className="text-slate-600 font-black hover:text-blue-500 transition-colors uppercase tracking-widest text-xs mt-4">BACK TO LOGIN</button>}
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-950 animate-in fade-in duration-1000 relative">
       <div className="absolute inset-0 bg-red-950/20 animate-pulse"></div>
       <div className="w-36 h-36 bg-red-600/10 border-4 border-red-600/40 rounded-full flex items-center justify-center text-7xl text-red-600 mb-10 animate-bounce relative z-10"><i className="fa-solid fa-face-dizzy"></i></div>
       <h1 className="text-6xl font-black mb-4 sinhala uppercase tracking-tighter text-white relative z-10">ගේම ඉවරයි මචං</h1>
       <p className="text-slate-500 text-2xl mb-14 sinhala font-medium relative z-10 leading-relaxed">මෙල්බර්න් වල කට්ට කන්න අමාරුයි වගේ...<br/>ආයෙත් ට්‍රයි එකක් දාමුද?</p>
       <button onClick={resetGame} className="px-14 py-7 bg-white text-slate-950 rounded-[2.5rem] font-black text-2xl hover:scale-110 shadow-2xl flex items-center gap-5 relative z-10"><i className="fa-solid fa-rotate-right"></i> ආයෙත් ගේමට</button>
    </div>
  );

  const renderRegister = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in zoom-in duration-500 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/40 border border-white/10 p-12 rounded-[3.5rem] shadow-2xl relative backdrop-blur-xl">
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 bg-blue-600 rounded-full border-8 border-slate-950 flex items-center justify-center text-5xl shadow-2xl text-white"><i className="fa-solid fa-passport"></i></div>
        <h2 className="text-4xl font-black mb-10 sinhala text-center pt-10 tracking-tight">ප්‍රොෆයිල් එක (Profile)</h2>
        <div className="space-y-8">
          <div><label className="block text-[11px] uppercase text-slate-500 font-black mb-3 tracking-widest sinhala">නම (First Name)</label><input type="text" value={character.name} onChange={e => setCharacter({...character, name: e.target.value})} className="w-full bg-slate-800/40 border border-white/10 p-6 rounded-3xl focus:outline-none focus:border-blue-500 font-black text-lg placeholder:text-slate-700" placeholder="Ex: Pathum" /></div>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-[11px] uppercase text-slate-500 font-black mb-3 tracking-widest sinhala">වයස (Age)</label><input type="number" value={character.age} onChange={e => setCharacter({...character, age: parseInt(e.target.value) || 0})} className="w-full bg-slate-800/40 border border-white/10 p-6 rounded-3xl focus:outline-none focus:border-blue-500 font-black text-lg" /></div>
            <div><label className="block text-[11px] uppercase text-slate-500 font-black mb-3 tracking-widest sinhala">Gender</label><select value={character.gender} onChange={e => setCharacter({...character, gender: e.target.value as Gender})} className="w-full bg-slate-800/40 border border-white/10 p-6 rounded-3xl focus:outline-none focus:border-blue-500 font-black text-lg appearance-none cursor-pointer"><option value="Male">Male</option><option value="Female">Female</option></select></div>
          </div>
          <div><label className="block text-[11px] uppercase text-slate-500 font-black mb-3 tracking-widest sinhala">Status</label><div className="grid grid-cols-3 gap-3">{(['Single', 'Couple', 'With Kids'] as RelationshipStatus[]).map(s => (<button key={s} onClick={() => setCharacter({...character, status: s})} className={`py-5 rounded-3xl border text-[10px] font-black transition-all ${character.status === s ? 'bg-blue-600 border-blue-400 text-white shadow-md' : 'bg-slate-800/30 border-white/5 text-slate-500'}`}>{s.toUpperCase()}</button>))}</div></div>
          
          {/* AI Mode Toggle */}
          <div className="border-t border-white/10 pt-6">
            <label className="block text-[11px] uppercase text-slate-500 font-black mb-3 tracking-widest">Game Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setUseAI(false); localStorage.removeItem('mlife_gemini_key'); }} className={`py-5 rounded-3xl border text-[10px] font-black transition-all ${!useAI ? 'bg-green-600 border-green-400 text-white shadow-md' : 'bg-slate-800/30 border-white/5 text-slate-500'}`}>
                <i className="fa-solid fa-book mr-2"></i>PRE-DEFINED STORIES
              </button>
              <button onClick={() => { setUseAI(true); setShowApiSettings(true); }} className={`py-5 rounded-3xl border text-[10px] font-black transition-all ${useAI ? 'bg-purple-600 border-purple-400 text-white shadow-md' : 'bg-slate-800/30 border-white/5 text-slate-500'}`}>
                <i className="fa-solid fa-robot mr-2"></i>AI CREATIVE MODE
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

          <button disabled={!character.name || character.name.length < 2 || (useAI && !apiKey)} onClick={() => setScreen('class-select')} className="w-full py-7 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:grayscale rounded-[2.5rem] font-black text-xl shadow-2xl text-white transition-all">
            {useAI && !apiKey ? 'ENTER API KEY FIRST' : 'NEXT: PICK SOCIAL CLASS'}
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
                    setShowApiSettings(false);
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
          <h2 className="text-4xl font-black mb-14 sinhala text-center tracking-tight">ජීවන තත්වය (Class)</h2>
          <div className="grid gap-5 w-full max-w-sm">
            {(Object.keys(INITIAL_STATS) as ProfileClass[]).map(p => (
              <button key={p} onClick={() => startGame(p)} className="p-8 bg-slate-900/60 border border-white/10 rounded-[2.5rem] hover:border-blue-500/60 transition-all text-left group hover:scale-[1.03] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-5 text-white transition-all duration-700">
                   <i className={`fa-solid ${p === 'ඇමති පුතා' ? 'fa-crown' : p === 'Business Family' ? 'fa-building' : p === 'Middle Class' ? 'fa-graduation-cap' : 'fa-handshake'}`}></i>
                </div>
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <span className="font-black text-2xl block mb-2 text-white group-hover:text-blue-400 uppercase tracking-tight">{p}</span>
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
    </div>
  );
};

export default App;
