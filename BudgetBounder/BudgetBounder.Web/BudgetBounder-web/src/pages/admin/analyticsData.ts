import type { AdminOverview } from '../../types/admin';
export type AnalyticsFilters = { startDate?: string; endDate?: string; userId?: number; isActive?: boolean | null };
export type AnalyticsPoint = { date: string; transactions: number; missionsCompleted: number; newUsers: number; missionXp: number; gameXp: number };
export type LevelPoint = { userId: number; recordedAt: string; level: number; xp: number };
export type AnalyticsData = { levelHistory?: LevelPoint[]; filters: AnalyticsFilters; summary: AdminOverview; trend: AnalyticsPoint[] };
export function analyticsCsv(data: AnalyticsData) {
  const rows: (string | number)[][] = [
    ['Start date (UTC)', data.filters.startDate || 'All time'], ['End date (UTC, inclusive)', data.filters.endDate || 'All time'],
    ['User ID', data.filters.userId || 'All users'], ['Account status', data.filters.isActive == null ? 'All' : data.filters.isActive ? 'Active' : 'Frozen'],
    [], ['Metric', 'Value', 'Scope'],
    ['Users', data.summary.totalUsers, 'Current cohort'], ['Active accounts', data.summary.activeUsers, 'Current cohort'], ['Frozen accounts', data.summary.inactiveUsers, 'Current cohort'],
    ['Average level', data.summary.averageUserLevel, 'Current cohort'], ['Savings goals', data.summary.savingsGoalsCreated, 'Cohort all time'],
    ['Transactions', data.summary.transactionsLogged, 'Selected period'], ['Completed missions', data.summary.missionsCompleted, 'Selected period'],
    ['New users', data.summary.newRegistrations, 'Selected period'], ['AI missions generated', data.summary.aiGeneratedMissions, 'Selected period'],
    [], ['Date (UTC)', 'Transactions', 'Completed missions', 'New users', 'Mission XP', 'Game XP'],
    ...data.trend.map(p => [p.date, p.transactions, p.missionsCompleted, p.newUsers, p.missionXp, p.gameXp]),
    [], ['User ID', 'Level recorded at (UTC)', 'Level', 'Total XP'],
    ...(data.levelHistory || []).map(p => [p.userId, p.recordedAt, p.level, p.xp]),
  ];
  return rows.map(row => row.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(',')).join('\r\n');
}
