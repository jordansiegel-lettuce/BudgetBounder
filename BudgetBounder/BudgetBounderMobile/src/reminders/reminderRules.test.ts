import { buildReminderPlan, type ReminderPreferences } from './reminderRules';

const preferences: ReminderPreferences = {
  dailyLogEnabled: true,
  dailyLogHour: 20,
  budgetAlertsEnabled: true,
  budgetThresholdPercent: 80,
  goalRemindersEnabled: true,
  goalReminderWeekday: 0,
  goalReminderHour: 18,
  missionAlertsEnabled: true,
};

describe('buildReminderPlan', () => {
  test('builds a daily logging reminder at the next configured local hour', () => {
    const plan = buildReminderPlan(preferences, {
      now: new Date('2026-08-04T19:00:00'),
      budget: 1000,
      spent: 200,
      activeGoalTitle: null,
      missionExpiresAt: null,
    });

    expect(plan).toContainEqual({
      key: 'daily-log',
      title: 'Keep your money map current',
      body: 'Log today\'s spending while it is still fresh.',
      date: new Date('2026-08-04T20:00:00'),
      url: '/(tabs)/transactions',
    });
  });

  test('alerts immediately when spending crosses the selected budget threshold', () => {
    const plan = buildReminderPlan(preferences, {
      now: new Date('2026-08-04T19:00:00'),
      budget: 1000,
      spent: 820,
      activeGoalTitle: null,
      missionExpiresAt: null,
    });

    expect(plan).toContainEqual({
      key: 'budget-threshold',
      title: 'Budget checkpoint reached',
      body: 'You have used 82% of this month\'s budget. Review your plan before the next purchase.',
      date: new Date('2026-08-04T19:01:00'),
      url: '/(tabs)',
    });
  });

  test('does not create disabled reminders', () => {
    const plan = buildReminderPlan({ ...preferences, dailyLogEnabled: false, budgetAlertsEnabled: false }, {
      now: new Date('2026-08-04T19:00:00'),
      budget: 1000,
      spent: 900,
      activeGoalTitle: null,
      missionExpiresAt: null,
    });

    expect(plan.map(item => item.key)).not.toContain('daily-log');
    expect(plan.map(item => item.key)).not.toContain('budget-threshold');
  });
});
