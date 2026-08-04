import type { DashboardResponse } from '@/src/types/api';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { buildReminderPlan, type ReminderPreferences } from './reminderRules';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

export async function syncSmartReminders(preferences: ReminderPreferences, dashboard: DashboardResponse) {
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return { scheduled: 0, permissionGranted: false };
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('smart-reminders', { name: 'Smart reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  const plan = buildReminderPlan(preferences, {
    now: new Date(), budget: dashboard.finance.budget, spent: dashboard.finance.spent,
    activeGoalTitle: dashboard.goal?.title ?? null, missionExpiresAt: dashboard.mission?.expiresAt ?? null,
  });
  await Promise.all(plan.map(item => Notifications.scheduleNotificationAsync({
    content: { title: item.title, body: item.body, data: { url: item.url } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.date },
  })));
  return { scheduled: plan.length, permissionGranted: true };
}

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  return current.granted ? current : Notifications.requestPermissionsAsync();
}
