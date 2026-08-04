export type ReminderPreferences = {
  dailyLogEnabled: boolean;
  dailyLogHour: number;
  budgetAlertsEnabled: boolean;
  budgetThresholdPercent: number;
  goalRemindersEnabled: boolean;
  goalReminderWeekday: number;
  goalReminderHour: number;
  missionAlertsEnabled: boolean;
};

export type ReminderContext = {
  now: Date;
  budget: number;
  spent: number;
  activeGoalTitle: string | null;
  missionExpiresAt: string | null;
};

export type PlannedReminder = {
  key: 'daily-log' | 'budget-threshold' | 'goal-check-in' | 'mission-expiry';
  title: string;
  body: string;
  date: Date;
  url: string;
};

function nextDaily(now: Date, hour: number) {
  const date = new Date(now);
  date.setHours(hour, 0, 0, 0);
  if (date <= now) date.setDate(date.getDate() + 1);
  return date;
}

function nextWeekly(now: Date, weekday: number, hour: number) {
  const date = new Date(now);
  date.setHours(hour, 0, 0, 0);
  const days = (weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + days);
  if (date <= now) date.setDate(date.getDate() + 7);
  return date;
}

export function buildReminderPlan(preferences: ReminderPreferences, context: ReminderContext): PlannedReminder[] {
  const reminders: PlannedReminder[] = [];
  if (preferences.dailyLogEnabled) {
    reminders.push({
      key: 'daily-log',
      title: 'Keep your money map current',
      body: "Log today's spending while it is still fresh.",
      date: nextDaily(context.now, preferences.dailyLogHour),
      url: '/(tabs)/transactions',
    });
  }

  const percent = context.budget > 0 ? Math.round((context.spent / context.budget) * 100) : 0;
  if (preferences.budgetAlertsEnabled && percent >= preferences.budgetThresholdPercent) {
    reminders.push({
      key: 'budget-threshold',
      title: 'Budget checkpoint reached',
      body: `You have used ${percent}% of this month's budget. Review your plan before the next purchase.`,
      date: new Date(context.now.getTime() + 60_000),
      url: '/(tabs)',
    });
  }

  if (preferences.goalRemindersEnabled && context.activeGoalTitle) {
    reminders.push({
      key: 'goal-check-in',
      title: `Check in on ${context.activeGoalTitle}`,
      body: 'A small contribution keeps your savings streak moving.',
      date: nextWeekly(context.now, preferences.goalReminderWeekday, preferences.goalReminderHour),
      url: '/(tabs)/goals',
    });
  }

  const expiry = context.missionExpiresAt ? new Date(context.missionExpiresAt) : null;
  if (preferences.missionAlertsEnabled && expiry && expiry > context.now && expiry.getTime() - context.now.getTime() <= 86_400_000) {
    reminders.push({
      key: 'mission-expiry',
      title: 'A mission is about to expire',
      body: 'Finish it before time runs out to keep the XP reward.',
      date: new Date(context.now.getTime() + 60_000),
      url: '/(tabs)/missions',
    });
  }
  return reminders;
}
