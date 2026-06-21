import { describe, it, expect, beforeEach } from 'vitest';
import { 
  saveLogs, loadLogs, 
  saveStats, loadStats, 
  saveUsername, loadUsername, 
  STORAGE_KEYS 
} from './persistence';
import { CarbonLog, UserStats } from '../types';

describe('Data Persistence Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Logs storage persistence', () => {
    it('returns default fallback value when no key or logs exist in cache', () => {
      const defaultVal: CarbonLog[] = [{ id: 'test-log', date: '2026-06-21', input: {} as any, co2Breakdown: {} as any }];
      const loaded = loadLogs(defaultVal);
      expect(loaded).toEqual(defaultVal);
    });

    it('saves and reads back logs collections accurately', () => {
      const logsToSave: CarbonLog[] = [
        { id: 'log-1', date: '2026-06-20', input: {} as any, co2Breakdown: { total: 12.5 } as any },
        { id: 'log-2', date: '2026-06-21', input: {} as any, co2Breakdown: { total: 8.0 } as any }
      ];

      saveLogs(logsToSave);
      
      const loaded = loadLogs([]);
      expect(loaded.length).toBe(2);
      expect(loaded[0].id).toBe('log-1');
      expect(loaded[1].co2Breakdown.total).toBe(8.0);
    });

    it('handles JSON parsing errors by returning the default logger list fallback', () => {
      localStorage.setItem(STORAGE_KEYS.LOGS, 'invalid-json-string{[');
      const defaultVal: CarbonLog[] = [];
      const loaded = loadLogs(defaultVal);
      expect(loaded).toEqual(defaultVal);
    });
  });

  describe('Stats storage persistence', () => {
    it('returns default fallback when no stats exist', () => {
      const defaultStats: UserStats = {
        totalPoints: 100,
        currentStreak: 2,
        highStreak: 5,
        lastLogDate: '2026-06-20',
        badges: [],
        challenges: []
      };

      const loaded = loadStats(defaultStats);
      expect(loaded).toEqual(defaultStats);
    });

    it('saves and loads stats correctly', () => {
      const statsToSave: UserStats = {
        totalPoints: 250,
        currentStreak: 4,
        highStreak: 10,
        lastLogDate: '2026-06-21',
        badges: [],
        challenges: []
      };

      saveStats(statsToSave);
      const loaded = loadStats({} as any);
      expect(loaded.totalPoints).toBe(250);
      expect(loaded.currentStreak).toBe(4);
    });

    it('returns default fallback value if retrieved JSON is corrupted', () => {
      localStorage.setItem(STORAGE_KEYS.STATS, '{corrupt_data:]');
      const defaultStats: UserStats = { totalPoints: 0 } as any;
      const loaded = loadStats(defaultStats);
      expect(loaded).toEqual(defaultStats);
    });
  });

  describe('Username storage persistence', () => {
    it('returns default fallback username when none is configured', () => {
      const loaded = loadUsername('EcoFighter');
      expect(loaded).toBe('EcoFighter');
    });

    it('saves and loads nickname successfully', () => {
      saveUsername('CarbonSlash');
      const loaded = loadUsername('EcoPioneer');
      expect(loaded).toBe('CarbonSlash');
    });
  });
});
