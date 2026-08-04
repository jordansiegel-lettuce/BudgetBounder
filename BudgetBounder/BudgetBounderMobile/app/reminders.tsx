import { Card, PixelLabel, PrimaryButton, Screen, StatePanel } from '@/src/components/BbUi';
import { requestNotificationPermission, syncSmartReminders } from '@/src/reminders/notificationService';
import type { ReminderPreferences } from '@/src/reminders/reminderRules';
import api from '@/src/services/api';
import { bb } from '@/src/theme/tokens';
import type { DashboardResponse } from '@/src/types/api';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';

export default function ReminderCenterScreen() {
  const [preferences, setPreferences] = useState<ReminderPreferences | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => { api.get<ReminderPreferences>('/reminder-preferences/me').then(r => setPreferences(r.data)).catch(() => setError('Reminder settings could not be loaded.')); }, []);
  function toggle(key: keyof ReminderPreferences) { setPreferences(current => current ? { ...current, [key]: !current[key] } : current); }
  async function save() {
    if (!preferences) return;
    setSaving(true); setError(''); setStatus('');
    try {
      const permission = await requestNotificationPermission();
      const [saved, dashboard] = await Promise.all([api.put<ReminderPreferences>('/reminder-preferences/me', preferences), api.get<DashboardResponse>('/dashboard/me')]);
      setPreferences(saved.data);
      const result = await syncSmartReminders(saved.data, dashboard.data);
      setStatus(result.permissionGranted ? `${result.scheduled} smart reminder${result.scheduled === 1 ? '' : 's'} scheduled.` : permission.canAskAgain ? 'Notification permission was not granted.' : 'Enable notifications in device settings to receive reminders.');
    } catch { setError('Your reminder settings were not saved. Try again.'); }
    finally { setSaving(false); }
  }
  if (error && !preferences) return <Screen><StatePanel title="REMINDER LINK ERROR" message={error} /></Screen>;
  if (!preferences) return <Screen><Text style={styles.muted}>Loading reminder rules...</Text></Screen>;
  return <Screen>
    <PixelLabel tone={bb.colors.violet}>SMART REMINDERS</PixelLabel><Text style={styles.title}>Reminder Center</Text>
    <Text style={styles.muted}>Helpful checkpoints based on your real budget and goals. No spam and no background tracking.</Text>
    <ReminderRow title="Daily money check-in" detail={`Every day at ${preferences.dailyLogHour}:00`} value={preferences.dailyLogEnabled} onChange={() => toggle('dailyLogEnabled')} />
    <ReminderRow title="Budget checkpoint" detail={`When spending reaches ${preferences.budgetThresholdPercent}%`} value={preferences.budgetAlertsEnabled} onChange={() => toggle('budgetAlertsEnabled')} />
    <ReminderRow title="Weekly savings nudge" detail="A gentle reminder to contribute to an active goal" value={preferences.goalRemindersEnabled} onChange={() => toggle('goalRemindersEnabled')} />
    <ReminderRow title="Mission expiry warning" detail="When an active mission has less than 24 hours left" value={preferences.missionAlertsEnabled} onChange={() => toggle('missionAlertsEnabled')} />
    {error ? <Text style={styles.error}>{error}</Text> : null}{status ? <Text style={styles.success}>{status}</Text> : null}
    <PrimaryButton loading={saving} onPress={save}>SAVE & SCHEDULE</PrimaryButton>
  </Screen>;
}

function ReminderRow({ title, detail, value, onChange }: { title: string; detail: string; value: boolean; onChange(): void }) {
  return <Card><View style={styles.row}><View style={styles.flex}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{detail}</Text></View><Switch value={value} onValueChange={onChange} color={bb.colors.emerald} /></View></Card>;
}
const styles = StyleSheet.create({ title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, cardTitle: { color: bb.colors.text, fontFamily: bb.fonts.display, fontSize: 16, fontWeight: '900', textTransform: 'uppercase' }, muted: { color: bb.colors.muted, fontSize: 12, lineHeight: 17 }, row: { flexDirection: 'row', alignItems: 'center', gap: 16 }, flex: { flex: 1, gap: 5 }, error: { color: bb.colors.coral }, success: { color: bb.colors.cyan, fontWeight: '900' } });
