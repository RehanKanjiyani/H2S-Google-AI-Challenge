import React, { useState } from 'react';
import { CarbonLog, UserStats, LeaderboardEntry } from '../types';
import { Users, TreePine, Sparkles, Send, Award, Trophy, Globe, Flame } from 'lucide-react';

interface CommunityImpactProps {
  logs: CarbonLog[];
  stats: UserStats;
  userName: string;
  onChangeUserName: (name: string) => void;
}

export default function CommunityImpact({ logs, stats, userName, onChangeUserName }: CommunityImpactProps) {
  const [typedName, setTypedName] = useState(userName);
  const [successMsg, setSuccessMsg] = useState(false);

  // Tree savings calculation
  const referenceStandardDaily = 20.0;
  const co2SavedTotal = logs.reduce((sum, l) => {
    const saved = referenceStandardDaily - l.co2Breakdown.total;
    return sum + (saved > 0 ? saved : 0);
  }, 0);
  const treesSavedEstimate = Number((co2SavedTotal / 22.0).toFixed(2));
  const currentLevel = Math.floor(stats.totalPoints / 200) + 1;

  // Let's generate a community leaderboard list mockup
  const rawLeaderboard: LeaderboardEntry[] = [
    { id: 'leader-1', name: 'Emma the EcoQueen 🌱', points: 950, rank: 1, avatarSeed: 'emma' },
    { id: 'leader-2', name: 'CarbonCutter99 ✂️', points: 740, rank: 2, avatarSeed: 'cutter' },
    { id: 'leader-3', name: 'EcoHero_Tom 🌍', points: 620, rank: 3, avatarSeed: 'tom' },
    { id: 'leader-4', name: userName, points: stats.totalPoints, rank: 4, avatarSeed: 'me', isCurrentUser: true },
    { id: 'leader-5', name: 'Sarah_Green_Sprout', points: 190, rank: 5, avatarSeed: 'sarah' },
    { id: 'leader-6', name: 'Zero-Waste Pioneer', points: 120, rank: 6, avatarSeed: 'zero' },
  ];

  // Dynamically sort and re-rank this leaderboard based on user points
  const sortedLeaderboard = [...rawLeaderboard]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1 // update ranks dynamically
    }));

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedName.trim()) {
      onChangeUserName(typedName.trim());
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="community-root">
      
      {/* Community Global Statistics Panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-800 font-display">Global EcoTrack Alliance</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EcoTrack Trees Saved</span>
              <span className="text-3xl font-black font-display text-emerald-700 mt-2 block">
                {Number((treesSavedEstimate + 4820).toFixed(2))}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
                Estimated impact of active participants implementing direct reduction protocols.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CO2 Offset Total</span>
              <span className="text-3xl font-black font-display text-emerald-700 mt-2 block">
                {Number((co2SavedTotal + 94220).toFixed(1))} kg
              </span>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
                Aggregated footprint offsets from meatless meals, public transit, and smart heating.
              </p>
            </div>
          </div>

          <div className="bg-[#15803d]/5 border border-emerald-100 rounded-xl p-4 mt-4 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-[#15803d] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">Your Collective Contribution</h4>
              <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                By logging {logs.length} carbon diary cards on EcoTrack AI, your current level {currentLevel} citizen profile supports the overall community footprint benchmarks. Encourage friends to check in!
              </p>
            </div>
          </div>
        </div>

        {/* Change User Nickname form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-800 mb-1 font-display">Manage Leaderboard Nickname</h3>
          <p className="text-xs text-slate-400 mb-4 leading-normal">
            Your name is displayed publicly on our mockup community leader boards. Change it below.
          </p>

          <form onSubmit={handleNameSubmit} className="flex gap-2 max-w-md">
            <input 
              type="text" 
              className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 w-full focus:outline-[#10b981]"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. EcoPioneer_Tom"
              required
            />
            <button
              type="submit"
              className="bg-[#15803d] hover:bg-emerald-800 text-white px-4 py-2 text-xs rounded-lg font-semibold flex items-center space-x-1.5 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Update Name</span>
            </button>
          </form>

          {successMsg && (
            <p className="text-emerald-700 text-[11px] mt-2 font-semibold">
              ✓ Nickname successfully updated! Updates will reflect across tables instantly.
            </p>
          )}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs" id="leaderboard-sidebar">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800 font-display">Sustainability Leaders</h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Week 24</span>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {sortedLeaderboard.map((entry) => {
            const isMe = entry.isCurrentUser;
            return (
              <div 
                key={entry.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  isMe 
                    ? 'border-emerald-600 bg-emerald-50/40 text-slate-800 font-semibold' 
                    : 'border-slate-50 bg-slate-50/20 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Rank badge */}
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    entry.rank === 1 ? 'bg-amber-100 text-amber-800' :
                    entry.rank === 2 ? 'bg-slate-200 text-slate-700' :
                    entry.rank === 3 ? 'bg-orange-100 text-orange-850' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {entry.rank}
                  </span>

                  {/* Icon Seed placeholder */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isMe ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <span className={`text-xs block ${isMe ? 'text-emerald-900 font-bold' : 'text-slate-700 font-medium'}`}>
                      {entry.name} {isMe && "(You)"}
                    </span>
                    <span className="text-[9px] text-slate-400">Class: Citizen Explorer</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-display block text-slate-800">{entry.points}</span>
                  <span className="text-[8px] text-slate-400 block uppercase font-bold">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
