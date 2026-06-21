import { describe, it, expect } from 'vitest';
import { evaluateStreak, evaluateAchievementsAndStreaks, sortAndRankLeaderboard } from './gamification';
import { CarbonLog, UserStats, LeaderboardEntry, AchievementBadge } from '../types';
import { createEmptyInput } from './carbonCalculator';

// Dummy template for Badge initialization
const getTestBadges = (): AchievementBadge[] => [
  { id: 'badge-1', title: 'First Steps', description: 'Log first', iconName: 'seed', unlocked: false, category: 'general' },
  { id: 'badge-2', title: 'Carbon Cutter Medal', description: 'Log below 12', iconName: 'cutter', unlocked: false, category: 'reduction' },
  { id: 'badge-3', title: 'Loyal Pioneer Medal', description: 'Streak >= 3', iconName: 'streak', unlocked: false, category: 'streak' },
  { id: 'badge-4', title: 'Green Hero Shield', description: 'Unused placeholder badge', iconName: 'hero', unlocked: false, category: 'reduction' },
  { id: 'badge-5', title: 'Transit Crusader', description: 'High transit', iconName: 'commuter', unlocked: false, category: 'transportation' },
  { id: 'badge-6', title: 'Vampire Slayer', description: 'Points >= 150', iconName: 'energy', unlocked: false, category: 'energy' },
];

const getTestStats = (): UserStats => ({
  totalPoints: 0,
  currentStreak: 0,
  highStreak: 0,
  lastLogDate: null,
  badges: getTestBadges(),
  challenges: []
});

describe('Gamification Logic', () => {
  describe('evaluateStreak', () => {
    it('returns 0 with empty logs list', () => {
      const streak = evaluateStreak([], '2026-06-21');
      expect(streak).toBe(0);
    });

    it('returns active streak (e.g. 1) if single log resides on today', () => {
      const logs: CarbonLog[] = [{
        id: '1', date: '2026-06-21', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 }
      }];
      const streak = evaluateStreak(logs, '2026-06-21');
      expect(streak).toBe(1);
    });

    it('returns active streak (e.g. 1) if single log was yesterday', () => {
      const logs: CarbonLog[] = [{
        id: '1', date: '2026-06-20', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 }
      }];
      const streak = evaluateStreak(logs, '2026-06-21');
      expect(streak).toBe(1);
    });

    it('returns 0 if single log is older than yesterday', () => {
      const logs: CarbonLog[] = [{
        id: '1', date: '2026-06-19', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 }
      }];
      const streak = evaluateStreak(logs, '2026-06-21');
      expect(streak).toBe(0);
    });

    it('measures sequential multi-day consecutive streaks correctly', () => {
      const logs: CarbonLog[] = [
        { id: '1', date: '2026-06-21', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 } },
        { id: '2', date: '2026-06-20', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 } },
        { id: '3', date: '2026-06-19', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 } },
      ];
      const streak = evaluateStreak(logs, '2026-06-21');
      expect(streak).toBe(3);
    });

    it('stops counting streak at the first consecutive day skip gap', () => {
      const logs: CarbonLog[] = [
        { id: '1', date: '2026-06-21', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 } },
        { id: '2', date: '2026-06-20', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 } },
        // date 19 is missed!
        { id: '3', date: '2026-06-18', input: createEmptyInput(), co2Breakdown: { transportation: 0, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0 } },
      ];
      const streak = evaluateStreak(logs, '2026-06-21');
      expect(streak).toBe(2);
    });
  });

  describe('evaluateAchievementsAndStreaks', () => {
    it('unlocks badge-1 (First Steps) when the user logs their first entry', () => {
      const logs: CarbonLog[] = [{
        id: '1', date: '2026-06-21', input: createEmptyInput(), co2Breakdown: { transportation: 5, electricity: 0, food: 0, waste: 0, shopping: 0, total: 5 }
      }];
      const stats = getTestStats();
      const updated = evaluateAchievementsAndStreaks(logs, stats, '2026-06-21');
      
      const badge1 = updated.badges.find(b => b.id === 'badge-1');
      expect(badge1?.unlocked).toBe(true);
      expect(badge1?.unlockedAt).toBe('2026-06-21');
    });

    it('unlocks badge-2 (Carbon Cutter Medal) when total carbon is under daily threshold', () => {
      const logs: CarbonLog[] = [{
        id: '1', date: '2026-06-21', input: createEmptyInput(), co2Breakdown: { transportation: 5, electricity: 1, food: 1, waste: 1, shopping: 1, total: 9.0 }
      }];
      const stats = getTestStats();
      const updated = evaluateAchievementsAndStreaks(logs, stats, '2026-06-21');
      
      const badge2 = updated.badges.find(b => b.id === 'badge-2');
      expect(badge2?.unlocked).toBe(true);
    });

    it('unlocks badge-3 (Loyal Pioneer Medal) when consistency streak hits 3 days', () => {
      const logs: CarbonLog[] = [
        { id: '1', date: '2026-06-21', input: createEmptyInput(), co2Breakdown: { transportation: 15, electricity: 0, food: 0, waste: 0, shopping: 0, total: 15 } },
        { id: '2', date: '2026-06-20', input: createEmptyInput(), co2Breakdown: { transportation: 15, electricity: 0, food: 0, waste: 0, shopping: 0, total: 15 } },
        { id: '3', date: '2026-06-19', input: createEmptyInput(), co2Breakdown: { transportation: 15, electricity: 0, food: 0, waste: 0, shopping: 0, total: 15 } },
      ];
      const stats = getTestStats();
      const updated = evaluateAchievementsAndStreaks(logs, stats, '2026-06-21');
      
      const badge3 = updated.badges.find(b => b.id === 'badge-3');
      expect(badge3?.unlocked).toBe(true);
    });

    it('unlocks badge-5 (Transit Crusader) when transit is high or carKm is 0 with some transit', () => {
      const input = createEmptyInput();
      input.transportation.carKm = 0;
      input.transportation.transitKm = 5;

      const logs: CarbonLog[] = [{
        id: '1', date: '2026-06-21', input, co2Breakdown: { transportation: 0.2, electricity: 0, food: 0, waste: 0, shopping: 0, total: 0.2 }
      }];
      
      const stats = getTestStats();
      const updated = evaluateAchievementsAndStreaks(logs, stats, '2026-06-21');
      
      const badge5 = updated.badges.find(b => b.id === 'badge-5');
      expect(badge5?.unlocked).toBe(true);
    });

    it('unlocks badge-6 (Vampire Slayer) when user reaches 150 points', () => {
      const stats = getTestStats();
      stats.totalPoints = 160;

      // Single log (prevents breaking badge-1 check etc.)
      const logs: CarbonLog[] = [{
        id: '1', date: '2026-06-21', input: createEmptyInput(), co2Breakdown: { transportation: 15, electricity: 0, food: 0, waste: 0, shopping: 0, total: 15 }
      }];

      const updated = evaluateAchievementsAndStreaks(logs, stats, '2026-06-21');
      const badge6 = updated.badges.find(b => b.id === 'badge-6');
      expect(badge6?.unlocked).toBe(true);
    });
  });

  describe('sortAndRankLeaderboard', () => {
    it('sorts competitors by points descending and updates ranks to correct sequence order', () => {
      const mockLeaderboard: LeaderboardEntry[] = [
        { id: '1', name: 'User A', points: 100, rank: 3, avatarSeed: 'a' },
        { id: '2', name: 'User B', points: 300, rank: 1, avatarSeed: 'b' },
        { id: '3', name: 'User C', points: 200, rank: 2, avatarSeed: 'c' },
      ];

      const sorted = sortAndRankLeaderboard(mockLeaderboard);
      
      expect(sorted[0].id).toBe('2'); // User B with 300 points
      expect(sorted[0].rank).toBe(1);

      expect(sorted[1].id).toBe('3'); // User C with 200 points
      expect(sorted[1].rank).toBe(2);

      expect(sorted[2].id).toBe('1'); // User A with 100 points
      expect(sorted[2].rank).toBe(3);
    });
  });
});
