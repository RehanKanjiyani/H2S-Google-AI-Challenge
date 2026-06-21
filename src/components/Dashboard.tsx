import React from 'react';
import { CarbonLog, UserStats } from '../types';
import { getCO2PerformanceText, CO2_GOAL_DAILY } from '../utils/carbonCalculator';
import { 
  Leaf, 
  TrendingDown, 
  TrendingUp,
  Flame, 
  Calendar, 
  Car, 
  Zap, 
  Utensils, 
  Trash2, 
  ShoppingBag, 
  TreePine,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  logs: CarbonLog[];
  stats: UserStats;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onNavigateToCalculator: () => void;
}

export default function Dashboard({ 
  logs, 
  stats, 
  selectedDate, 
  onSelectDate,
  onNavigateToCalculator
}: DashboardProps) {
  // Find current selected log
  const selectedLog = logs.find(l => l.date === selectedDate);
  const currentTotal = selectedLog ? selectedLog.co2Breakdown.total : 0;
  
  // Overall CO2 calculations
  const totalCarbonEverLogged = logs.reduce((sum, l) => sum + l.co2Breakdown.total, 0);
  
  // Calculate average daily reference (global average ~16kg, U.S. ~40kg, goal ~12kg)
  const averageDailyFootprint = logs.length > 0 
    ? Number((totalCarbonEverLogged / logs.length).toFixed(1)) 
    : 0;

  // Trees Saved Estimate
  // A mature tree absorbs ~22kg of CO2 per year, or ~0.06kg per day.
  // Standard daily emission reference is 20kg CO2. If user registers under 20kg, we count the saved difference.
  const referenceStandardDaily = 20.0;
  const co2SavedTotal = logs.reduce((sum, l) => {
    const saved = referenceStandardDaily - l.co2Breakdown.total;
    return sum + (saved > 0 ? saved : 0);
  }, 0);
  const treesSavedEstimate = Number((co2SavedTotal / 22.0).toFixed(2));

  // Streak status
  const currentStreak = stats.currentStreak;

  // Group breakdown category keys
  const categoriesMap = [
    { key: 'transportation', label: 'Transportation', icon: Car, color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-100' },
    { key: 'electricity', label: 'Household Energy', icon: Zap, color: 'bg-amber-100 text-amber-700', border: 'border-amber-100' },
    { key: 'food', label: 'Food Habits', icon: Utensils, color: 'bg-emerald-100 text-[#15803d]', border: 'border-emerald-100' },
    { key: 'waste', label: 'Waste Generation', icon: Trash2, color: 'bg-teal-100 text-teal-700', border: 'border-teal-100' },
    { key: 'shopping', label: 'Shopping & Goods', icon: ShoppingBag, color: 'bg-rose-100 text-rose-700', border: 'border-rose-100' },
  ];

  // Performance parameters
  const perf = getCO2PerformanceText(currentTotal);
  const overGoal = currentTotal > CO2_GOAL_DAILY;
  const percentageOfGoal = Math.min(Math.round((currentTotal / CO2_GOAL_DAILY) * 100), 100);

  // Weekly data (last 7 logs)
  const last7Logs = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7).reverse();
  const maxWeeklyValue = Math.max(...last7Logs.map(l => l.co2Breakdown.total), 15);

  // Monthly breakdown average vs previous logs
  const averageAll = logs.length > 0 ? totalCarbonEverLogged / logs.length : 0;

  return (
    <div className="space-y-6" id="dashboard-root">
      {/* Upper Status summary block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Score Circle Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between" id="daily-score-card">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Daily Footprint</span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              <span>{selectedDate}</span>
            </div>
          </div>

          <div className="my-6 flex flex-col items-center justify-center relative">
            {selectedLog ? (
              <>
                <svg className="w-36 h-36 transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="#F1F5F9"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Foreground Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke={overGoal ? "#FDA4AF" : "#10B981"}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 64}
                    strokeDashoffset={2 * Math.PI * 64 * (1 - percentageOfGoal / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                {/* Center label */}
                <div className="absolute text-center">
                  <span className="text-3xl font-bold font-display text-slate-800">{currentTotal}</span>
                  <span className="text-xs text-slate-400 block font-medium">kg CO2e</span>
                </div>
              </>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-center">
                <Leaf className="w-10 h-10 text-slate-300 animate-bounce mb-2" />
                <button 
                  onClick={onNavigateToCalculator}
                  className="text-xs bg-emerald-50 text-[#15803d] hover:bg-emerald-100 transition px-3 py-1.5 rounded-lg font-semibold"
                >
                  Log Carbon Today
                </button>
              </div>
            )}
          </div>

          <div>
            {selectedLog ? (
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${perf.bg} ${perf.color}`}>
                  {perf.label}
                </span>
                <p className="text-slate-400 text-xs mt-2">
                  Target: <strong className="text-slate-700">{CO2_GOAL_DAILY} kg CO2e</strong> per day.
                </p>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400">No entry logged yet for this date.</p>
            )}
          </div>
        </div>

        {/* Community & Personal Savings Stats */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between" id="ecological-impact-card">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Personal Impact</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Saved {co2SavedTotal.toFixed(1)} kg CO2e Total
              </span>
            </div>

            <div className="mt-6 flex items-center space-x-4">
              <div className="p-3.5 bg-emerald-100 rounded-2xl text-[#15803d]">
                <TreePine className="w-8 h-8" />
              </div>
              <div>
                <span className="text-3xl font-display font-bold text-slate-800">{treesSavedEstimate}</span>
                <span className="text-slate-400 text-xs ml-1 font-medium">mature trees</span>
                <p className="text-slate-500 text-xs mt-1">
                  Estimated trees that would need to expand for a year to capture your saved carbon footprint logs.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
              <span>Your Avg: <strong>{averageDailyFootprint} kg</strong></span>
            </div>
            <span>Global Avg: ~16 kg</span>
          </div>
        </div>

        {/* Active Streaks and Achievements summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between" id="streak-summary-card">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Gamification Stats</span>
              <div className="flex items-center space-x-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                <span>{currentStreak} Day Streak</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold font-display text-slate-800">{stats.totalPoints}</span>
                  <span className="text-slate-400 text-xs ml-2 font-medium">Eco Points</span>
                </div>
                <div className="flex -space-x-2">
                  {stats.badges.filter(b => b.unlocked).slice(0, 3).map((badge) => (
                    <div 
                      key={badge.id}
                      title={badge.title} 
                      className="w-8 h-8 rounded-full bg-linear-to-tr from-yellow-300 to-amber-500 border-2 border-white flex items-center justify-center text-xs text-amber-950 font-bold shadow-xs cursor-pointer"
                    >
                      🏅
                    </div>
                  ))}
                  {stats.badges.filter(b => b.unlocked).length === 0 && (
                    <span className="text-slate-300 text-xs italic">No badges unlocked</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-700">Daily Tip</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {stats.challenges.some(c => !c.completed)
                      ? "Complete today's challenge to secure +25 Points!"
                      : "Awesome job, you completed today's direct eco tracks!"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400">Streak Record: {stats.highStreak} days</span>
            <span className="text-xs text-emerald-600 font-semibold">Level {Math.floor(stats.totalPoints / 200) + 1} eco-pioneer</span>
          </div>
        </div>
      </div>

      {/* Selected date breakdown categories */}
      <h3 className="text-lg font-semibold text-slate-800 pt-2 flex items-center space-x-2 font-display">
        <Leaf className="w-5 h-5 text-emerald-500" />
        <span>Carbon Composition Breakdown</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="categories-breakdown-row">
        {categoriesMap.map((cat) => {
          const value = selectedLog 
            ? (selectedLog.co2Breakdown[cat.key as keyof typeof selectedLog.co2Breakdown] as number) 
            : 0;
          const share = currentTotal > 0 ? Math.round((value / currentTotal) * 100) : 0;

          return (
            <div 
              key={cat.key} 
              className={`bg-white rounded-xl p-4 border border-slate-100 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${cat.color}`}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded-full font-bold text-slate-500">
                  {share}% share
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">{cat.label}</span>
                <span className="text-xl font-bold font-display text-slate-800">{value}</span>
                <span className="text-[10px] text-slate-400 ml-1">kg CO2e</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full ${share > 40 ? 'bg-rose-400' : 'bg-emerald-400'}`} 
                  style={{ width: `${share}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Weekly Trend Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs lg:col-span-2" id="weekly-trend-chart-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800 font-display">Weekly Metrics Trend</h3>
              <p className="text-xs text-slate-400">Footprint logs over the last 7 logged days</p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold bg-slate-50 px-3 py-1 rounded-full">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              <span>Target Limit: {CO2_GOAL_DAILY}kg</span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between space-x-2 pt-6 pb-2 px-2 border-b border-slate-100">
            {last7Logs.length > 0 ? (
              last7Logs.map((log) => {
                const total = log.co2Breakdown.total;
                const percent = Math.min((total / maxWeeklyValue) * 85 + 5, 95); // offset values so they are visible
                const dateObj = new Date(log.date);
                const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dateString = log.date.slice(5); // MM-DD
                const isSelected = log.date === selectedDate;

                return (
                  <div 
                    key={log.date} 
                    className="flex-1 flex flex-col items-center group cursor-pointer"
                    onClick={() => onSelectDate(log.date)}
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bg-slate-900 text-slate-50 text-[10px] font-bold px-2.5 py-1.5 rounded-lg -translate-y-12 transition duration-200 pointer-events-none z-10 text-center shadow-md">
                      <span>{total} kg CO2e</span>
                      <span className="block text-[8px] text-slate-400">{log.date}</span>
                    </div>

                    {/* Grid Target reference line segment wrapper */}
                    <div className="w-full relative h-48 flex items-end justify-center mb-2">
                      {/* Interactive block bar */}
                      <div 
                        className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 ${
                          isSelected 
                            ? 'bg-emerald-600 shadow-xs' 
                            : total > CO2_GOAL_DAILY 
                              ? 'bg-rose-200 hover:bg-rose-300' 
                              : 'bg-emerald-200 hover:bg-emerald-300'
                        }`}
                        style={{ height: `${percent}%` }}
                      >
                        {/* Target line indicators overlay */}
                        {percent > (CO2_GOAL_DAILY / maxWeeklyValue * 100) && (
                          <div className="w-full bg-rose-400/30 h-1 absolute bottom-1/2 left-0 pointer-events-none" />
                        )}
                      </div>
                    </div>

                    <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      {dayLabel}
                    </span>
                    <span className="text-[9px] text-slate-400">{dateString}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <Leaf className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
                <span>Log some carbon levels to preview weekly patterns.</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs mt-3 select-none">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs" />
              <span className="text-slate-500">Under Daily Target</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-rose-400 rounded-xs" />
              <span className="text-slate-500">Above target limit</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-emerald-700 rounded-xs" />
              <span className="text-slate-500 font-medium">Selected Date</span>
            </span>
          </div>
        </div>

        {/* Calendar Selection & Historical logs drawer */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs" id="historical-logs-sidebar">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-800 font-display">Log History Browser</h3>
            <p className="text-xs text-slate-400">Select any date below to inspect the logs</p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1" id="history-scroller">
            {logs.length > 0 ? (
              [...logs].sort((a, b) => b.date.localeCompare(a.date)).map((log) => {
                const isSelected = log.date === selectedDate;
                const performance = getCO2PerformanceText(log.co2Breakdown.total);

                return (
                  <button
                    key={log.date}
                    onClick={() => onSelectDate(log.date)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs' 
                        : 'border-slate-100 bg-slate-50/30 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-950' : 'text-slate-700'}`}>
                        {log.date}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {log.co2Breakdown.total} kg CO2e
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>Trans: {log.co2Breakdown.transportation} kg</span>
                      <span className={`px-2 py-0.2 rounded-xs font-bold text-[9px] ${performance.bg} ${performance.color}`}>
                        {performance.label.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-slate-400 text-xs italic text-center py-6">No historical records available</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50">
            <button 
              onClick={onNavigateToCalculator}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition duration-200 text-center"
            >
              Add New Log Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
