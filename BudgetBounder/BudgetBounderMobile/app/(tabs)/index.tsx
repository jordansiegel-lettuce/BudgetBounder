import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, PrimaryButton, Progress, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb, formatIls } from '@/src/theme/tokens';
import type { DashboardResponse } from '@/src/types/api';
import { getXpProgress } from '@/src/progression/xpProgress';
import { router, type Href, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading) return <View style={styles.center}><ActivityIndicator color={bb.colors.emerald} size="large" /><Text style={styles.muted}>Preparing your next move…</Text></View>;
  if (error || !data) return <Screen><StatePanel title="Connection interrupted" message={error} action={<PrimaryButton onPress={load}>TRY AGAIN</PrimaryButton>} /></Screen>;

  const xp = getXpProgress(data.user.xp);
  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.title}>GOOD MORNING, {(data.user.fullName || user?.fullName || 'PLAYER').split(' ')[0].toUpperCase()}</Text>
          <Text style={styles.muted}>Your budget and activity for this month.</Text>
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
        <PixelLabel tone={bb.colors.violet}>✧ NOVA INSIGHT</PixelLabel><PrimaryButton onPress={() => router.push('/coach' as Href)}>ASK NOVA</PrimaryButton>
        <Text style={styles.muted}>Ask Nova for a plan based on your budget, goals, and recent activity.</Text>
      </Card>

      <Card><PixelLabel tone={bb.colors.gold}>PROGRESSION</PixelLabel><Text style={styles.cardTitle}>{Math.round(data.user.xp)} TOTAL XP · {data.user.currentStreak} DAY STREAK</Text><Progress value={xp.progress} tone={bb.colors.gold} /><Text style={styles.muted}>{xp.nextLevelAt == null ? 'Maximum level reached' : `${Math.round(xp.current)} / ${xp.required} XP in this level · next level at ${xp.nextLevelAt}`}</Text></Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: bb.colors.canvas, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  flex: { flex: 1, gap: 10 },
  title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontWeight: '900', fontSize: 24, lineHeight: 28, textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2 },
  muted: { color: bb.colors.muted, fontSize: 13, lineHeight: 20 },
  level: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: bb.colors.gold, borderTopColor: '#FFE2A6', borderLeftColor: '#FFE2A6', borderRightColor: bb.colors.navGold, borderBottomColor: bb.colors.navGold, borderWidth: 2, borderRadius: bb.radius.sm },
  summaryRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  icon: { width: 54, height: 54, borderRadius: bb.radius.md, borderWidth: 1, borderColor: bb.colors.emerald, alignItems: 'center', justifyContent: 'center', backgroundColor: bb.colors.raised },
  iconText: { color: bb.colors.emerald, fontSize: 26 },
  amount: { color: bb.colors.text, fontWeight: '800', fontSize: 17 },
  cardTitle: { color: bb.colors.text, fontFamily: bb.fonts.display, fontWeight: '900', fontSize: 18, textTransform: 'uppercase' },
});
