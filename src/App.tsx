import React, { useState, useEffect } from 'react';
import { CarbonLog, CarbonCalculatorInput, UserStats, AchievementBadge, EcoChallenge } from './types';
import { calculateCO2Breakdown, createDummyLogs, createEmptyInput } from './utils/carbonCalculator';
import Dashboard from './components/Dashboard';
import CarbonCalculator from './components/CarbonCalculator';
import AICoach from './components/AICoach';
import Gamification from './components/Gamification';
import CommunityImpact from './components/CommunityImpact';
import { 
  Leaf, 
  LayoutDashboard, 
  Calculator, 
  Sparkles, 
  Award, 
  Users, 
  X, 
  Flame, 
  Calendar,
  Settings,
  HelpCircle
} from 'lucide-react';

const STORAGE_KEYS = {
  LOGS: 'ecotrack_logs',
  STATS: 'ecotrack_stats',
  USERNAME: 'ecotrack_username'
};

const DEFAULT_BADGES: AchievementBadge[] = [
  { id: 'badge-1', title: 'First Steps (Seed)', description: 'Log your first daily carbon footprint card.', iconName: 'seed', unlocked: false, category: 'general' },
  { id: 'badge-2', title: 'Carbon Cutter Medal', description: 'Log a footprint card safely under our 12.0 kg CO2 target.', iconName: 'cutter', unlocked: false, category: 'reduction' },
  { id: 'badge-3', title: 'Loyal Pioneer Medal', description: 'Maintain a consistency streak of 3 days or more.', iconName: 'streak', unlocked: false, category: 'streak' },
  { id: 'badge-5', title: 'Transit Crusader', description: 'Log a car-free day or travel more than 15km on public transit.', iconName: 'commuter', unlocked: false, category: 'transportation' },
  { id: 'badge-6', title: 'Vampire Slayer', description: 'Reach 150 points or complete 2 Daily Challenges.', iconName: 'energy', unlocked: false, category: 'energy' },
];

const DEFAULT_CHALLENGES: EcoChallenge[] = [
  {
    id: 'chal-1',
    title: 'Pedal-Powered Grocery run',
    description: 'Avoid motor vehicles and walk or bicycle for short neighborhood errands.',
    points: 30,
    category: 'transport',
    difficulty: 'medium',
    completed: false
  },
  {
    id: 'chal-2',
    title: 'Standby Savior Sweep',
    description: 'Unplug 4 idle chargers, kitchen appliances or TV screens before bed.',
    points: 20,
    category: 'energy',
    difficulty: 'easy',
    completed: false
  },
  {
    id: 'chal-3',
    title: 'Veggie Delice Meals',
    description: 'Replace standard meat dishes with nutritious plant-based dishes today.',
    points: 25,
    category: 'food',
    difficulty: 'easy',
    completed: false
  }
];

export default function App() {
  // 1. Core States
  const [logs, setLogs] = useState<CarbonLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [userName, setUserName] = useState<string>('EcoBuddy');
  const [activeView, setActiveView] = useState<'dashboard' | 'calculator' | 'coach' | 'gamification' | 'community'>('dashboard');

  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    currentStreak: 0,
    highStreak: 0,
    lastLogDate: null,
    badges: DEFAULT_BADGES,
    challenges: DEFAULT_CHALLENGES
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // 2. Load cached data on mount
  useEffect(() => {
    // Load Nickname
    const cachedName = localStorage.getItem(STORAGE_KEYS.USERNAME);
    if (cachedName) {
      setUserName(cachedName);
    } else {
      setShowWelcomeModal(true);
    }

    // Load Logs
    const cachedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    let masterLogs: CarbonLog[] = [];
    if (cachedLogs) {
      masterLogs = JSON.parse(cachedLogs);
      setLogs(masterLogs);
    } else {
      // Seed high-fidelity dummy records of 30 days
      masterLogs = createDummyLogs();
      setLogs(masterLogs);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(masterLogs));
    }

    // Load Stats
    const cachedStats = localStorage.getItem(STORAGE_KEYS.STATS);
    if (cachedStats) {
      setStats(JSON.parse(cachedStats));
    } else {
      // Create initial stats card
      const initialStats: UserStats = {
        totalPoints: 40, // standard start point
        currentStreak: 3, // pre-seed
        highStreak: 3,
        lastLogDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
        badges: DEFAULT_BADGES,
        challenges: DEFAULT_CHALLENGES
      };
      
      // Check initial badge rules based on seeded logs
      recalculateBadgesAndStreaks(masterLogs, initialStats);
    }
  }, []);

  // Sync back to local storage whenever logs or stats update
  const saveLogsToCache = (newLogs: CarbonLog[]) => {
    setLogs(newLogs);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(newLogs));
  };

  const saveStatsToCache = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  };

  // Helper calculation for Badges and Consistency Streaks
  const recalculateBadgesAndStreaks = (allLogs: CarbonLog[], currentStats: UserStats) => {
    const updatedStats = { ...currentStats };
    const todayStr = new Date().toISOString().split('T')[0];

    // Compute Streak count
    // Put logged dates in sorted unique checklist
    const sortedLoggedDates = Array.from(new Set(allLogs.map(l => l.date)))
      .sort((a, b) => b.localeCompare(a)); // desc order [today, yesterday, pre-yesterday]

    let streak = 0;
    if (sortedLoggedDates.length > 0) {
      let latestDateObj = new Date(sortedLoggedDates[0]);
      const differenceFromTodayMs = Math.abs(new Date(todayStr).getTime() - latestDateObj.getTime());
      const differenceDays = Math.ceil(differenceFromTodayMs / (1000 * 60 * 60 * 24));

      // Streak is only active if latest log is today or yesterday
      if (differenceDays <= 1) {
        streak = 1;
        let expectedDate = new Date(latestDateObj);
        
        for (let i = 1; i < sortedLoggedDates.length; i++) {
          expectedDate.setDate(expectedDate.getDate() - 1);
          const nextDateStr = expectedDate.toISOString().split('T')[0];
          if (sortedLoggedDates[i] === nextDateStr) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    updatedStats.currentStreak = streak;
    if (streak > updatedStats.highStreak) {
      updatedStats.highStreak = streak;
    }

    // Badge Evaluation
    updatedStats.badges = updatedStats.badges.map(badge => {
      if (badge.unlocked) return badge; // keep unlocked status

      let unlockThis = false;
      
      if (badge.id === 'badge-1' && allLogs.length > 0) {
        unlockThis = true;
      }
      
      if (badge.id === 'badge-2') {
        // Any logged entry with <= 12kg of CO2
        unlockThis = allLogs.some(l => l.co2Breakdown.total <= 12.0 && l.co2Breakdown.total > 0);
      }

      if (badge.id === 'badge-3' && streak >= 3) {
        unlockThis = true;
      }

      if (badge.id === 'badge-5') {
        // High public transit or car-free traveling logged
        unlockThis = allLogs.some(l => l.input.transportation.transitKm > 15 || (l.input.transportation.carKm === 0 && l.input.transportation.transitKm > 0));
      }

      if (badge.id === 'badge-6' && (updatedStats.totalPoints >= 150 || updatedStats.challenges.filter(c => c.completed).length >= 2)) {
        unlockThis = true;
      }

      if (unlockThis) {
        return {
          ...badge,
          unlocked: true,
          unlockedAt: todayStr
        };
      }
      return badge;
    });

    saveStatsToCache(updatedStats);
  };

  // 3. User Trigger Actions
  const handleSaveLog = (input: CarbonCalculatorInput) => {
    const co2Breakdown = calculateCO2Breakdown(input);
    const existingLogIndex = logs.findIndex(l => l.date === selectedDate);
    
    let updatedLogs = [...logs];
    if (existingLogIndex >= 0) {
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        input,
        co2Breakdown
      };
    } else {
      updatedLogs.push({
        id: `log-${selectedDate}`,
        date: selectedDate,
        input,
        co2Breakdown
      });
      // award 10 points for first logging of the day
      const updatedStats = { ...stats };
      updatedStats.totalPoints += 10;
      saveStatsToCache(updatedStats);
    }

    saveLogsToCache(updatedLogs);
    
    // Evaluate streak and badges
    const freshStats = { ...stats };
    recalculateBadgesAndStreaks(updatedLogs, freshStats);
  };

  const handleCompleteChallenge = (id: string, points: number) => {
    const updatedChallenges = stats.challenges.map(c => 
      c.id === id ? { ...c, completed: true } : c
    );

    const updatedStats = {
      ...stats,
      totalPoints: stats.totalPoints + points,
      challenges: updatedChallenges
    };

    saveStatsToCache(updatedStats);
    // evaluate triggers
    recalculateBadgesAndStreaks(logs, updatedStats);
  };

  const handleRefreshChallenges = (newChallenges: EcoChallenge[]) => {
    const updatedStats = {
      ...stats,
      challenges: newChallenges
    };
    saveStatsToCache(updatedStats);
  };

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    localStorage.setItem(STORAGE_KEYS.USERNAME, newName);
  };

  return (
    <div className="min-h-screen bg-[#f7faf6] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      
      {/* 1. SIDEBAR Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800" id="aside-sidebar">
        <div>
          {/* Brand/App Title */}
          <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Leaf className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight font-display text-white">EcoTrack AI</h1>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Hack2Skill Pioneer</span>
            </div>
          </div>

          {/* User profile Quick Bar */}
          <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold font-display text-white shadow-xs">
              {userName.slice(0,2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Citizen Pioneer</span>
              <strong className="text-xs text-emerald-100 font-bold block leading-tight">{userName}</strong>
              <div className="flex items-center space-x-1.5 text-[10px] text-amber-500 font-bold mt-0.5">
                <Flame className="w-3.5 h-3.5 fill-amber-500 stroke-none animate-pulse" />
                <span>{stats.currentStreak} Day Streak</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 select-none" id="desktop-routing-links">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeView === 'dashboard' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Metrics Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('calculator')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeView === 'calculator' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Carbon Calculator</span>
            </button>

            <button
              onClick={() => setActiveView('coach')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeView === 'coach' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Coach Feedback</span>
            </button>

            <button
              onClick={() => setActiveView('gamification')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeView === 'gamification' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Gamified Badges</span>
            </button>

            <button
              onClick={() => setActiveView('community')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeView === 'community' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Community Impact</span>
            </button>
          </nav>
        </div>

        {/* Footnotes */}
        <div className="p-4 border-t border-slate-800 text-center space-y-2 select-none">
          <div className="text-[10px] text-slate-500 font-medium">
            EcoTrack AI Agent Build 1.0.4
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Controls bar */}
        <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-8 flex items-center justify-between shadow-3xs" id="workspace-top-bar">
          <div className="flex items-center space-x-3">
            <div className="md:hidden p-2 bg-emerald-50 text-[#15803d] rounded-lg">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 capitalize leading-normal">
                {activeView === 'coach' ? 'AI Sustainability Coach' : `${activeView} portal`}
              </h2>
              <p className="text-[11px] text-slate-400">Reduce emissions daily with adaptive insights</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick date selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input 
                type="date" 
                className="bg-transparent border-none text-xs font-semibold focus:outline-hidden cursor-pointer"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="bg-emerald-50 text-[#15803d] font-bold text-xs py-1.5 px-3 rounded-xl border border-emerald-100">
              {stats.totalPoints} XP
            </div>
          </div>
        </header>

        {/* Dynamic view routing wrapper */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {activeView === 'dashboard' && (
            <Dashboard 
              logs={logs}
              stats={stats}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onNavigateToCalculator={() => setActiveView('calculator')}
            />
          )}

          {activeView === 'calculator' && (
            <CarbonCalculator 
              onSaveLog={handleSaveLog}
              selectedDate={selectedDate}
              currentLogForDate={logs.find(l => l.date === selectedDate)}
            />
          )}

          {activeView === 'coach' && (
            <AICoach 
              logs={logs}
              stats={stats}
              onCompleteChallenge={handleCompleteChallenge}
              onRefreshChallenges={handleRefreshChallenges}
            />
          )}

          {activeView === 'gamification' && (
            <Gamification stats={stats} />
          )}

          {activeView === 'community' && (
            <CommunityImpact 
              logs={logs}
              stats={stats}
              userName={userName}
              onChangeUserName={handleUpdateUserName}
            />
          )}
        </div>

        {/* Mobile Navigation bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 text-white z-50 select-none">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center space-y-0.5 ${activeView === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px]">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveView('calculator')}
            className={`flex flex-col items-center space-y-0.5 ${activeView === 'calculator' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Calculator className="w-4 h-4" />
            <span className="text-[9px]">Calculator</span>
          </button>
          <button 
            onClick={() => setActiveView('coach')}
            className={`flex flex-col items-center space-y-0.5 ${activeView === 'coach' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[9px]">AI Coach</span>
          </button>
          <button 
            onClick={() => setActiveView('gamification')}
            className={`flex flex-col items-center space-y-0.5 ${activeView === 'gamification' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Award className="w-4 h-4" />
            <span className="text-[9px]">Badges</span>
          </button>
          <button 
            onClick={() => setActiveView('community')}
            className={`flex flex-col items-center space-y-0.5 ${activeView === 'community' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[9px]">Community</span>
          </button>
        </nav>
      </main>

      {/* Welcome Setup Nickname Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="welcome-modal">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full border border-slate-100 space-y-6 relative">
            <button 
              onClick={() => setShowWelcomeModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-50 transition text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="p-3 bg-emerald-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-[#15803d]">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold font-display text-slate-800">Welcome to EcoTrack AI</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Let's setup your sustainability credentials so you can start logging transit habits, meals, and completing custom AI challenges!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Enter your Eco-Buddy Nickname</label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. CarbonCutter_007"
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 font-bold focus:outline-[#10b981]"
                />
              </div>

              <button
                onClick={() => {
                  if (userName.trim()) {
                    handleUpdateUserName(userName.trim());
                    setShowWelcomeModal(false);
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition duration-200"
              >
                Launch Carbon Diary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
