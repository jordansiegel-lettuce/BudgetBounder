import { describe, it, expect } from 'vitest';
import { analyticsCsv } from './analyticsData';
describe('filtered analytics export', () => {
  it('exports selected filters, scope labels and actual trend values', () => {
    const csv = analyticsCsv({ filters: { startDate: '2026-09-01', userId: 7, isActive: false }, summary: { totalUsers: 1, activeUsers: 0, inactiveUsers: 1, newRegistrations: 0, transactionsLogged: 2, missionsCompleted: 1, averageUserLevel: 3, savingsGoalsCreated: 4, aiGeneratedMissions: 0 }, trend: [{ date: '2026-09-02', transactions: 2, missionsCompleted: 1, newUsers: 0, missionXp: 50, gameXp: 10 }] });
    expect(csv).toContain('"User ID","7"'); expect(csv).toContain('"Frozen"'); expect(csv).toContain('"Savings goals","4","Cohort all time"'); expect(csv).toContain('"2026-09-02","2","1","0","50","10"');
  });
});
