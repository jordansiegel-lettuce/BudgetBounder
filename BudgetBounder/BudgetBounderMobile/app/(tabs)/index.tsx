import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, PrimaryButton, Progress, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb, formatIls } from '@/src/theme/tokens';
import type { DashboardResponse } from '@/src/types/api';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await api.get<DashboardResponse>('/dashboard/me');
      setData(response.data);
    } catch {
      setError('Your dashboard could not be loaded. Your data is safe.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={bb.colors.emerald} size="large" /><Text style={styles.muted}>Preparing your next move…</Text></View>;
  if (error || !data) return <Screen><StatePanel title="Connection interrupted" message={error} action={<PrimaryButton onPress={load}>TRY AGAIN</PrimaryButton>} /></Screen>;

  const xpIntoLevel = data.user.xp % 500;
  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.title}>GOOD MORNING, {(data.user.fullName || user?.fullName || 'PLAYER').split(' ')[0].toUpperCase()}</Text>
          <Text style={styles.muted}>Financial health is steady this month.</Text>
        </View>
        <View style={styles.level}><PixelLabel>LV {data.user.level} · ✦ {Math.round(data.user.xp)}</PixelLabel></View>
      </View>

      <Card accent={bb.colors.emerald}>
        <View style={styles.summaryRow}><View style={styles.icon}><Text style={styles.iconText}>✦</Text></View><View style={styles.flex}>
          <Text style={styles.amount}>{formatIls(data.finance.remainingBudget)} remaining</Text>
          <Progress value={data.finance.budget ? data.finance.remainingBudget / data.finance.budget : 0} />
          <Text style={styles.muted}>{formatIls(data.finance.spent)} spent this month</Text>
        </View></View>
      </Card>

      {data.mission ? <Card accent={bb.colors.gold}>
        <PixelLabel tone={bb.colors.gold}>TODAY&apos;S MISSION · +{data.mission.xpReward} XP</PixelLabel>
        <Text style={styles.cardTitle}>{data.mission.title}</Text>
        <Text style={styles.muted}>{data.mission.description}</Text>
        <Progress value={data.mission.targetValue ? data.mission.currentProgress / data.mission.targetValue : 0} tone={bb.colors.gold} />
        <PrimaryButton onPress={() => router.push('/(tabs)/missions' as Href)}>VIEW MISSION</PrimaryButton>
      </Card> : <StatePanel title="Mission board clear" message="New personalized missions will appear here." />}

      {data.goal ? <Card>
        <PixelLabel tone={bb.colors.cyan}>SAVINGS VAULT</PixelLabel>
        <Text style={styles.cardTitle}>{data.goal.title}</Text>
        <Text style={styles.amount}>{formatIls(data.goal.currentAmount)} / {formatIls(data.goal.targetAmount)}</Text>
        <Progress value={data.goal.targetAmount ? data.goal.currentAmount / data.goal.targetAmount : 0} tone={bb.colors.cyan} />
        <PrimaryButton onPress={() => router.push('/(tabs)/goals' as Href)}>VIEW DETAILS</PrimaryButton>
      </Card> : <StatePanel title="No active vault" message="Create a savings goal to start filling your first vault." />}

      <Card accent={bb.colors.violet}>
        <PixelLabel tone={bb.colors.violet}>✧ NOVA INSIGHT</PixelLabel>
        <Text style={styles.muted}>Your next recommendation will use your real budget, goals, and recent activity without judgment.</Text>
      </Card>

      <Card><PixelLabel tone={bb.colors.gold}>PROGRESSION</PixelLabel><Text style={styles.cardTitle}>{data.user.currentStreak} day streak</Text><Progress value={xpIntoLevel / 500} tone={bb.colors.gold} /><Text style={styles.muted}>{Math.round(xpIntoLevel)} / 500 XP toward the next level</Text></Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: bb.colors.canvas, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  flex: { flex: 1, gap: 10 },
  title: { color: bb.colors.emerald, fontFamily: 'monospace', fontWeight: '900', fontSize: 20, lineHeight: 28 },
  muted: { color: bb.colors.muted, fontSize: 13, lineHeight: 20 },
  level: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: bb.colors.raised, borderColor: bb.colors.emerald, borderWidth: 1, borderRadius: bb.radius.sm },
  summaryRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  icon: { width: 54, height: 54, borderRadius: bb.radius.md, borderWidth: 1, borderColor: bb.colors.emerald, alignItems: 'center', justifyContent: 'center', backgroundColor: bb.colors.raised },
  iconText: { color: bb.colors.emerald, fontSize: 26 },
  amount: { color: bb.colors.text, fontWeight: '800', fontSize: 17 },
  cardTitle: { color: bb.colors.text, fontWeight: '800', fontSize: 19 },
});
