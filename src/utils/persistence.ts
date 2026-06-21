import { CarbonLog, UserStats } from '../types';

export const STORAGE_KEYS = {
  LOGS: 'ecotrack_logs',
  STATS: 'ecotrack_stats',
  USERNAME: 'ecotrack_username'
};

export function saveLogs(logs: CarbonLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs to localStorage', e);
  }
}

export function loadLogs(defaultLogs: CarbonLog[]): CarbonLog[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Error loading logs from localStorage', e);
  }
  return defaultLogs;
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats to localStorage', e);
  }
}

export function loadStats(defaultStats: UserStats): UserStats {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.STATS);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Error loading stats from localStorage', e);
  }
  return defaultStats;
}

export function saveUsername(username: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  } catch (e) {
    console.error('Error saving username to localStorage', e);
  }
}

export function loadUsername(defaultUsername: string): string {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.USERNAME);
    if (cached) {
      return cached;
    }
  } catch (e) {
    console.error('Error loading username from localStorage', e);
  }
  return defaultUsername;
}
