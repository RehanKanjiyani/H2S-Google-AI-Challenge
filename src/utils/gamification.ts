import { CarbonLog, UserStats, AchievementBadge, LeaderboardEntry } from '../types';

export function evaluateStreak(allLogs: CarbonLog[], todayStr: string): number {
  const sortedLoggedDates = Array.from(new Set(allLogs.map(l => l.date)))
    .sort((a, b) => b.localeCompare(a)); // desc order

  let streak = 0;
  if (sortedLoggedDates.length > 0) {
    const latestDateObj = new Date(sortedLoggedDates[0]);
    const differenceFromTodayMs = Math.abs(new Date(todayStr).getTime() - latestDateObj.getTime());
    const differenceDays = Math.ceil(differenceFromTodayMs / (1000 * 60 * 60 * 24));

    // Streak is only active if latest log is today or yesterday
    if (differenceDays <= 1) {
      streak = 1;
      const expectedDate = new Date(latestDateObj);
      
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
  return streak;
}

export function evaluateAchievementsAndStreaks(
  allLogs: CarbonLog[],
  currentStats: UserStats,
  todayStr: string
): UserStats {
  const updatedStats = { ...currentStats };
  const streak = evaluateStreak(allLogs, todayStr);

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
      // Any logged entry with <= 12kg of CO2 and total > 0
      unlockThis = allLogs.some(l => l.co2Breakdown.total <= 12.0 && l.co2Breakdown.total > 0);
    }

    if (badge.id === 'badge-3' && streak >= 3) {
      unlockThis = true;
    }

    if (badge.id === 'badge-5') {
      // High public transit or car-free traveling logged
      unlockThis = allLogs.some(
        l => l.input.transportation.transitKm > 15 || 
             (l.input.transportation.carKm === 0 && l.input.transportation.transitKm > 0)
      );
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

  return updatedStats;
}

export function sortAndRankLeaderboard(rawLeaderboard: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...rawLeaderboard]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
}
