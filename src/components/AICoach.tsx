import React, { useState, useEffect } from 'react';
import { CarbonLog, UserStats, AICoachFeedback, EcoChallenge } from '../types';
import { 
  Sparkles, 
  RotateCw, 
  Check, 
  AlertCircle, 
  User, 
  CheckCircle, 
  ArrowRight,
  HelpCircle,
  TrendingDown,
  Clock,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';

interface AICoachProps {
  logs: CarbonLog[];
  stats: UserStats;
  onCompleteChallenge: (id: string, points: number) => void;
  onRefreshChallenges: (newChallenges: EcoChallenge[]) => void;
}

export default function AICoach({ 
  logs, 
  stats, 
  onCompleteChallenge,
  onRefreshChallenges
}: AICoachProps) {
  const [feedback, setFeedback] = useState<AICoachFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingChallenges, setGeneratingChallenges] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Generate a text description of the logs to feed to the AI summary
  const generateLogsSummaryText = () => {
    if (logs.length === 0) return "No history recorded yet.";
    
    // Last 3 logs
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    return sorted.map(l => 
      `Date: ${l.date}, Total CO2: ${l.co2Breakdown.total}kg (Transport: ${l.co2Breakdown.transportation}kg, Energy: ${l.co2Breakdown.electricity}kg, Food: ${l.co2Breakdown.food}kg, Waste: ${l.co2Breakdown.waste}kg, Shopping: ${l.co2Breakdown.shopping}kg)`
    ).join('\n');
  };

  const getUserStatsString = () => {
    return `Points: ${stats.totalPoints}, Current Streak: ${stats.currentStreak} days, Badges earned: ${stats.badges.filter(b => b.unlocked).map(b => b.title).join(', ')}`;
  };

  // Determine highest emission category dynamically for feedback fallback
  const getHighestCategory = () => {
    if (logs.length === 0) return "transportation";
    const totals = {
      transportation: 0,
      electricity: 0,
      food: 0,
      waste: 0,
      shopping: 0,
    };
    logs.forEach(l => {
      totals.transportation += l.co2Breakdown.transportation;
      totals.electricity += l.co2Breakdown.electricity;
      totals.food += l.co2Breakdown.food;
      totals.waste += l.co2Breakdown.waste;
      totals.shopping += l.co2Breakdown.shopping;
    });
    
    let maxCat = 'transportation';
    let maxVal = 0;
    Object.entries(totals).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxCat = cat;
      }
    });
    return maxCat;
  };

  const fetchAICoachInsights = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const logsSummary = generateLogsSummaryText();
      const statsStr = getUserStatsString();

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logsSummary, userStats: statsStr })
      });

      if (!res.ok) {
        throw new Error('API server failed');
      }

      const data = await res.json();
      if (data.feedback) {
        setFeedback(data.feedback);
      } else {
        throw new Error('Malformed feedback response');
      }
    } catch (e: any) {
      console.warn("AI Coach API call failed. Using offline smart fallback reports.", e);
      // Fallback is constructed locally
      const mockSummary = generateLogsSummaryText();
      const localFeedback = getLocalFallback(mockSummary);
      setFeedback(localFeedback);
    } finally {
      setLoading(false);
    }
  };

  // Refresh daily challenges via AI api / local
  const refreshChallenges = async () => {
    setGeneratingChallenges(true);
    try {
      const highest = getHighestCategory();
      const completedIds = stats.challenges.filter(c => c.completed).map(c => c.id);

      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highestCategory: highest, completedIds })
      });

      if (!res.ok) throw new Error('Challenge API failed');
      const data = await res.json();
      if (data.challenges && Array.isArray(data.challenges)) {
        onRefreshChallenges(data.challenges);
      }
    } catch (e) {
      console.warn("Challenge generation fallback executed.");
      // Just supply clean default structures
      const fallbackChallenges = getChallengeFallbacks(getHighestCategory());
      onRefreshChallenges(fallbackChallenges);
    } finally {
      setGeneratingChallenges(false);
    }
  };

  // Fetch coach on mount
  useEffect(() => {
    if (!feedback) {
      fetchAICoachInsights();
    }
  }, []);

  // Offline high fidelity fallbacks
  function getLocalFallback(summary: string): AICoachFeedback {
    const highest = getHighestCategory();
    if (highest === 'electricity') {
      return {
        sustainabilityScoreText: "Your electric grid utilization represents your greatest carbon vector. Optimizing temperature set points and unplugging idle media centers will significantly reduce your footprint.",
        scoreColor: "amber",
        personalizedSuggestions: [
          {
            title: "Optimize Fridge Coil Space",
            description: "Leave 5cm margin behind refrigerators for fluid thermodynamics. Overheated compressors consume up to 20% more power.",
            impact: "Saves ~4.2kg CO2e/week",
            category: "energy",
            complexity: "low"
          },
          {
            title: "Wash Clothes on Eco-Cold",
            description: "Change washing cycles to 30°C or cold tap temperature. Warm elements consume up to 90% of a water cycles energy draft.",
            impact: "Saves ~6.0kg CO2e/week",
            category: "energy",
            complexity: "low"
          },
          {
            title: "Smart Socket Strips",
            description: "Connect office setups to a remote power bar. Idle monitors, docking blocks, and speakers drain standby kilowatts overnight.",
            impact: "Saves ~3.5kg CO2e/week",
            category: "energy",
            complexity: "medium"
          }
        ],
        habitsRecommendations: [
          "Set thermostat to 21°C max",
          "Air dry clean linens",
          "Switch laptop power modes"
        ],
        tips: [
          "Incandescent bulbs generate 90% radiant heat waste. Upgrade directly to energy star LEDs.",
          "Clearing screen brightness can cut computing overheads by 15-20% immediately.",
          "Unmanaged standby power drains cost up to $150 a year in grid leakage charges."
        ]
      };
    } else if (highest === 'food') {
      return {
        sustainabilityScoreText: "Your carbon composition contains elevated agricultural indicators. Substituting beef or poultry for local legumes provides instantaneous carbon scaling improvements.",
        scoreColor: "green",
        personalizedSuggestions: [
          {
            title: "Double the Beans & Grains",
            description: "Create wholesome rice-and-beans or savory standard lentil soups weekly. Red meat is structurally intensive to farm.",
            impact: "Saves ~14.5kg CO2e/week",
            category: "food",
            complexity: "low"
          },
          {
            title: "Zero Waste Stock Prep",
            description: "Store high-fiber organic vegetable scraps (carrot peaks, onion hulls) in a dry freezer bag and boil them down to vegetable broth.",
            impact: "Saves ~8.0kg CO2e/week",
            category: "food",
            complexity: "medium"
          },
          {
            title: "Adopt Local Corner Stands",
            description: "Procure local garden greens to reduce international bulk cooling cargo transit networks.",
            impact: "Saves ~5.5kg CO2e/week",
            category: "food",
            complexity: "low"
          }
        ],
        habitsRecommendations: [
          "Avoided fast food packaging",
          "Finished all dinner portions",
          "Drank tap water instead of sodas"
        ],
        tips: [
          "1 kg of beef produces up to 60 kg of CO2e — nearly double that of sheep or pork.",
          "Organic scrap rotting in standard dense landfills releases high volumes of global-warming methane.",
          "Seasonal eating aligns our diet directly with natural local cycles."
        ]
      };
    } else {
      // Default / Transport fallback
      return {
        sustainabilityScoreText: "Transportation forms the largest portion of your environmental footprint. Making active-transit choices on short trips creates immediate benefits.",
        scoreColor: "emerald",
        personalizedSuggestions: [
          {
            title: "Neighborhood Walk/Cycle Runs",
            description: "Walk or bike for all neighborhood errands and trips under 2.5 kilometers instead of cold-cranking your engine.",
            impact: "Saves ~7.5kg CO2e/week",
            category: "transport",
            complexity: "low"
          },
          {
            title: "Align Commutes & Carpool",
            description: "Coordinate with coworkers to bundle office commutes, saving highway tolls, gasoline bills, and parking stress.",
            impact: "Saves ~15.0kg CO2e/week",
            category: "transport",
            complexity: "medium"
          },
          {
            title: "Optimize Idle Habits",
            description: "Turn your vehicle off if stopping for more than 30 seconds. Idling wastes fuel and releases untreated tailpipe emissions.",
            impact: "Saves ~3.2kg CO2e/week",
            category: "transport",
            complexity: "low"
          }
        ],
        habitsRecommendations: [
          "Took a train or public bus",
          "Avoided high speed highway runs",
          "Grouped together shopping orders"
        ],
        tips: [
          "One city bus can remove forty occupied individual vehicles from traffic lanes.",
          "Ensuring tires are properly inflated can increase overall gas mileage by up to 3.3%.",
          "Walking short routes promotes cardiovascular system health while leaving atmospheric exhaust levels at zero."
        ]
      };
    }
  }

  function getChallengeFallbacks(highestCategory: string): EcoChallenge[] {
    return [
      {
        id: 'fallback-chal-active',
        title: 'Bicycle Neighborhood Explorer',
        description: 'Complete at least one grocery run or commute milestone on your bicycle or by walking.',
        points: 40,
        category: 'transport',
        difficulty: 'medium',
        completed: false
      },
      {
        id: 'fallback-chal-unplug',
        title: 'Master of Standby Sockets',
        description: 'Sweep your household and completely unplug 4 idle wall chargers or screens before bed.',
        points: 20,
        category: 'energy',
        difficulty: 'easy',
        completed: false
      },
      {
        id: 'fallback-chal-leftovers',
        title: 'Waste Fighter Cleanup',
        description: 'Turn organic leftovers or slightly soft vegetables into a hearty homemade stir-fry or soup.',
        points: 30,
        category: 'food',
        difficulty: 'easy',
        completed: false
      }
    ];
  }

  // Get color styles for the AI coach category tag
  const getCategoryTheme = (cat: string) => {
    switch(cat) {
      case 'transport': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'energy': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'food': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'waste': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'shopping': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6" id="ai-coach-root">
      
      {/* AI Coach Banner Status card */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10">
          <Sparkles className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-700/60 rounded-xl">
                <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold font-display tracking-wide">EcoTrack AI Susty Coach</h2>
            </div>
            
            <button
              onClick={fetchAICoachInsights}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-emerald-700/60 hover:bg-emerald-600/70 text-emerald-100 px-3 py-1.5 rounded-lg text-xs transition duration-200"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Refresh Insights'}</span>
            </button>
          </div>

          <div>
            <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider block mb-1">Coach Assessment</span>
            {feedback ? (
              <p className="text-sm font-medium text-slate-100 leading-relaxed max-w-3xl">
                "{feedback.sustainabilityScoreText}"
              </p>
            ) : (
              <div className="h-10 flex items-center">
                <div className="w-2/3 h-4 bg-emerald-700/50 rounded-xs animate-pulse" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-emerald-200">
            <span>Powered by <strong>Gemini 3.5 Flash</strong></span>
            <span>•</span>
            <span>Real-time environmental reasoning framework</span>
          </div>
        </div>
      </div>

      {/* Main feedback body splitting suggestions and challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Personalized Actions (Suggestions) Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center space-x-2 font-display">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
            <span>Targeted Reduction Actions</span>
          </h3>

          <div className="space-y-4">
            {feedback ? (
              feedback.personalizedSuggestions.map((sug, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryTheme(sug.category)}`}>
                          {sug.category.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sug.complexity === 'low' ? 'bg-green-50 text-green-700' :
                          sug.complexity === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {sug.complexity} complexity
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">{sug.title}</h4>
                      <p className="text-xs text-slate-500 leading-normal">{sug.description}</p>
                    </div>

                    <div className="bg-emerald-50 text-[#15803d] px-3 py-2 rounded-xl text-center shrink-0 ml-4 font-bold max-w-[120px]">
                      <span className="block text-[9px] uppercase tracking-wider text-emerald-600">Impact</span>
                      <span className="text-[11px] font-semibold">{sug.impact}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3].map((num) => (
                <div key={num} className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded-md w-1/4" />
                  <div className="h-6 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-10 bg-slate-100 rounded-md w-full" />
                </div>
              ))
            )}
          </div>

          {/* Tips and Recipes sub-grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Sustainability Tips</h4>
              <ul className="space-y-2.5">
                {feedback ? feedback.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                )) : (
                  <li className="h-12 bg-slate-100 rounded-md animate-pulse" />
                )}
              </ul>
            </div>

            <div className="bg-slate-100/40 border border-slate-100 rounded-2xl p-5 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Habit Checklists</h4>
              <ul className="space-y-2.5">
                {feedback ? feedback.habitsRecommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-center space-x-2.5 font-medium">
                    <div className="w-4 h-4 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[9px]">
                      ✓
                    </div>
                    <span>{rec}</span>
                  </li>
                )) : (
                  <li className="h-12 bg-slate-100 rounded-md animate-pulse" />
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Daily Challenges Column */}
        <div className="space-y-4" id="daily-challenges-column">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 flex items-center space-x-2 font-display">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Daily Eco Challenges</span>
            </h3>
            
            <button 
              onClick={refreshChallenges}
              disabled={generatingChallenges}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-semibold transition"
            >
              {generatingChallenges ? 'Refreshing...' : 'New Challenges'}
            </button>
          </div>

          <div className="space-y-3">
            {stats.challenges.map((chal) => (
              <div 
                key={chal.id}
                className={`border rounded-xl p-4 transition duration-200 flex flex-col justify-between h-40 ${
                  chal.completed 
                    ? 'bg-slate-50 border-slate-200 text-slate-400' 
                    : 'bg-white border-slate-100 text-slate-800 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      chal.difficulty === 'easy' ? 'bg-emerald-50 text-[#15803d]' :
                      chal.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {chal.difficulty.toUpperCase()} • {chal.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      +{chal.points} XP
                    </span>
                  </div>
                  
                  <h4 className={`text-xs font-bold mt-2 ${chal.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {chal.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1 max-w-[240px]">
                    {chal.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-50 flex justify-end">
                  {chal.completed ? (
                    <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold font-sans">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Task Completed (+{chal.points} XP)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onCompleteChallenge(chal.id, chal.points)}
                      className="bg-[#15803d] hover:bg-emerald-800 text-white font-semibold text-[11px] py-1 px-3 rounded-lg transition"
                    >
                      Complete Action
                    </button>
                  )}
                </div>
              </div>
            ))}

            {stats.challenges.length === 0 && (
              <div className="bg-white border border-slate-100 rounded-xl p-6 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
                <p className="text-xs leading-normal">
                  No challenges retrieved yet. Trigger challenge generation to get started!
                </p>
                <button 
                  onClick={refreshChallenges}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Generate Challenges
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
