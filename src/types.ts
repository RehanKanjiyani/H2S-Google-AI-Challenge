export interface CarbonCalculatorInput {
  transportation: {
    carKm: number;
    fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
    transitKm: number;
    flightHrs: number;
  };
  electricity: {
    kwh: number;
    renewablePct: number;
  };
  food: {
    meatMeals: number; // number of meat-heavy meals per day/week depending on entry mode
    vegMeals: number;  // vegetarian meals
    veganMeals: number; // vegan meals
    localFoodPct: number; // percentage of locally sourced ingredients
  };
  waste: {
    organicKg: number;
    nonRecyclableKg: number;
    recycledPct: number;
  };
  shopping: {
    clothingItems: number;
    electronicsItems: number;
    generalItems: number;
  };
}

export interface CarbonLog {
  id: string;
  date: string; // YYYY-MM-DD
  input: CarbonCalculatorInput;
  co2Breakdown: {
    transportation: number;
    electricity: number;
    food: number;
    waste: number;
    shopping: number;
    total: number;
  };
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'transport' | 'energy' | 'food' | 'waste' | 'shopping' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  highStreak: number;
  lastLogDate: string | null;
  badges: AchievementBadge[];
  challenges: EcoChallenge[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatarSeed: string;
  isCurrentUser?: boolean;
}

export interface AICoachFeedback {
  sustainabilityScoreText: string;
  scoreColor: string;
  personalizedSuggestions: {
    title: string;
    description: string;
    impact: string; // e.g. "Saves ~12kg CO2/week"
    category: 'transport' | 'energy' | 'food' | 'waste' | 'shopping';
    complexity: 'low' | 'medium' | 'high';
  }[];
  habitsRecommendations: string[];
  tips: string[];
}
