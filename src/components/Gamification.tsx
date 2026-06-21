import React from 'react';
import { UserStats, AchievementBadge } from '../types';
import { Award, Flame, Star, Sparkles, Check, Lock, ChevronRight, Gauge } from 'lucide-react';

interface GamificationProps {
  stats: UserStats;
}

export default function Gamification({ stats }: GamificationProps) {
  const currentPoints = stats.totalPoints;
  
  // Calculate Level indicators (each level is 200 points)
  const POINTS_PER_LEVEL = 200;
  const currentLevel = Math.floor(currentPoints / POINTS_PER_LEVEL) + 1;
  const xpInCurrentLevel = currentPoints % POINTS_PER_LEVEL;
  const percentToNextLevel = Math.min(Math.round((xpInCurrentLevel / POINTS_PER_LEVEL) * 100), 100);

  // Helper icons mapped for beauty
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'seed': return '🌱';
      case 'cutter': return '✂️';
      case 'streak': return '🔥';
      case 'scholar': return '🎓';
      case 'commuter': return '🚲';
      case 'energy': return '🔋';
      default: return '🏅';
    }
  };

  return (
    <div className="space-y-6" id="gamification-root">
      {/* Upper Progress dashboard card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Level Progression */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs md:col-span-2 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Character Level</span>
              <h3 className="text-xl font-bold font-display text-slate-800 mt-1">
                Level {currentLevel} Carbon Explorer
              </h3>
            </div>
            <div className="bg-emerald-50 text-[#15803d] h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg border border-emerald-100">
              Lv {currentLevel}
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="my-6">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-semibold">
              <span>{xpInCurrentLevel} / {POINTS_PER_LEVEL} XP</span>
              <span>{percentToNextLevel}% completed</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-50">
              <div 
                className="h-full bg-linear-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-500"
                style={{ width: `${percentToNextLevel}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Earn XP by logging footprints daily and completing AI Challenges!</span>
          </div>
        </div>

        {/* Action Streak panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between" id="strength-streak-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consistency Streak</span>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">Active</span>
          </div>

          <div className="my-4 text-center">
            <div className="relative inline-block">
              <Flame className="w-16 h-16 text-amber-500 mx-auto fill-amber-400 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center pt-3">
                <span className="text-xl font-black font-display text-amber-950">{stats.currentStreak}</span>
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-700 mt-2">{stats.currentStreak} Consecutive Days</h4>
            <p className="text-xs text-slate-400 leading-normal px-2 mt-1">
              Your record streak is <strong>{stats.highStreak} days</strong>. Logging keeps the planet clean!
            </p>
          </div>

          <div className="text-center pt-2 border-t border-slate-50 text-[10px] text-slate-400">
            Next milestone: Reach 5 days streak (+50 XP)
          </div>
        </div>

      </div>

      {/* Badges Achievement Shelf Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center space-x-2 font-display">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Sustainability Badges & Credentials</span>
          </h3>
          <p className="text-xs text-slate-400">Complete various parameters to unlock and wear collectible shields</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="badges-grid">
          {stats.badges.map((badge) => (
            <div 
              key={badge.id}
              className={`p-5 rounded-2xl border transition duration-200 flex items-start space-x-4 ${
                badge.unlocked 
                  ? 'bg-white border-slate-100' 
                  : 'bg-slate-50/50 border-dashed border-slate-200 text-slate-400 opacity-80'
              }`}
            >
              <div className={`p-3.5 rounded-2xl shrink-0 text-3xl flex items-center justify-center select-none ${
                badge.unlocked 
                  ? 'bg-emerald-50' 
                  : 'bg-slate-100 filter grayscale'
              }`}>
                {getBadgeIcon(badge.iconName)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className={`text-xs font-bold ${badge.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                    {badge.title}
                  </h4>
                  {badge.unlocked ? (
                    <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center text-[8px] text-[#15803d] font-black">
                      ✓
                    </div>
                  ) : (
                    <div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center text-[8px] text-slate-400">
                      🔒
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {badge.description}
                </p>
                {badge.unlocked && badge.unlockedAt && (
                  <span className="text-[9px] text-[#15803d] bg-emerald-50/50 px-2 py-0.2 rounded-xs font-semibold inline-block mt-1">
                    Unlocked on {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
