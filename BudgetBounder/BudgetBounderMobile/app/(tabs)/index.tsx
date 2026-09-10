import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, PrimaryButton, Progress, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb, formatIls } from '@/src/theme/tokens';
import type { DashboardResponse } from '@/src/types/api';
import { getXpProgress } from '@/src/progression/xpProgress';
import { router, type Href, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

type EarnedBadge = { id: number; code: string; name: string; description: string; unlockedAt: string };

/** Each reward code gets its own mark so badges are recognisable at a glance. */
const BADGE_ICONS: Record<string, string> = {
  'first-entry': '✎',
  'first-mission': '⚑',
  'first-vault': '🏦',
  'level-five': '★',
  'tower-explorer': '⚔',
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
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
  // Badges are a secondary flourish: if the sync fails the dashboard still renders.
  const loadBadges = useCallback(async () => {
    try {
      const response = await api.post<EarnedBadge[]>('/achievements/sync');
      setBadges(response.data);
    } catch {
      setBadges([]);
    }
  }, []);
  useFocusEffect(useCallback(() => { void load(); void loadBadges(); }, [load, loadBadges]));

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
        <LevelCrest level={data.user.level} progress={xp.progress} xp={data.user.xp} />
      </View>

      <Card accent={bb.colors.gold}>
        <View style={styles.levelRow}>
          <View style={styles.flex}>
            <PixelLabel tone={bb.colors.gold}>FINANCE LEVEL {data.user.level}</PixelLabel>
            <Text style={styles.levelHeadline}>{Math.round(data.user.xp)} XP · {data.user.currentStreak} DAY STREAK</Text>
          </View>
          <View style={styles.streakChip}><Text style={styles.streakFlame}>🔥</Text><Text style={styles.streakCount}>{data.user.currentStreak}</Text></View>
        </View>
        <View style={styles.xpBarRow}>
          <Text style={styles.levelTick}>LV {data.user.level}</Text>
          <View style={styles.xpBarFlex}><Progress value={xp.progress} tone={bb.colors.gold} /></View>
          <Text style={styles.levelTick}>LV {xp.nextLevelAt == null ? 'MAX' : data.user.level + 1}</Text>
        </View>
        <Text style={styles.muted}>
          {xp.nextLevelAt == null
            ? 'Maximum level reached — you have mastered the tower.'
            : `${Math.round(xp.required - xp.current)} XP to level ${data.user.level + 1}`}
        </Text>
      </Card>

      <BadgeShelf badges={badges} />

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

    </Screen>
  );
}

/**
 * The level used to be a small text chip. This gives it the weight of an
 * earned rank: a medallion whose ring fills as XP accumulates toward the
 * next level, so progress is visible without reading a number.
 */
function LevelCrest({ level, progress, xp }: { level: number; progress: number; xp: number }) {
  const filled = Math.round(Math.max(0, Math.min(1, progress)) * 12);
  return (
    <View accessibilityLabel={`Finance level ${level}, ${Math.round(xp)} XP`} style={styles.crest}>
      <View style={styles.crestRing}>
        {Array.from({ length: 12 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.crestPip,
              { transform: [{ rotate: `${index * 30}deg` }, { translateY: -25 }] },
              index < filled && styles.crestPipFilled,
            ]}
          />
        ))}
        <View style={styles.crestCore}>
          <Text style={styles.crestKicker}>LEVEL</Text>
          <Text style={styles.crestLevel}>{level}</Text>
        </View>
      </View>
      <Text style={styles.crestXp}>✦ {Math.round(xp)}</Text>
    </View>
  );
}

/** Earned achievement badges, surfaced on the home screen rather than buried in Profile. */
function BadgeShelf({ badges }: { badges: EarnedBadge[] }) {
  return (
    <Card accent={bb.colors.violet}>
      <View style={styles.badgeHeader}>
        <PixelLabel tone={bb.colors.violet}>ACHIEVEMENT BADGES</PixelLabel>
        <Text style={styles.badgeCount}>{badges.length} EARNED</Text>
      </View>
      {badges.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
          {badges.map(badge => (
            <View key={badge.id} style={styles.badge}>
              <View style={styles.badgeMedal}><Text style={styles.badgeIcon}>{BADGE_ICONS[badge.code] ?? '✦'}</Text></View>
              <Text numberOfLines={2} style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.muted}>Log an expense, finish a quest or clear a tower floor to earn your first badge.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: bb.colors.canvas, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  flex: { flex: 1, gap: 10 },
  title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontWeight: '900', fontSize: 24, lineHeight: 28, textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2 },
  muted: { color: bb.colors.muted, fontSize: 13, lineHeight: 20 },
  crest: { alignItems: 'center', gap: 4 },
  crestRing: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: bb.colors.raised, borderWidth: 2, borderColor: bb.colors.border },
  crestPip: { position: 'absolute', width: 4, height: 8, borderRadius: 2, backgroundColor: bb.colors.chromeSoft },
  crestPipFilled: { backgroundColor: bb.colors.gold },
  crestCore: { width: 42, height: 42, borderRadius: 21, backgroundColor: bb.colors.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderTopColor: '#FFE2A6', borderLeftColor: '#FFE2A6', borderRightColor: bb.colors.navGold, borderBottomColor: bb.colors.navGold },
  crestKicker: { color: '#6E3B0A', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  crestLevel: { color: '#3A1F05', fontSize: 20, lineHeight: 22, fontWeight: '900' },
  crestXp: { color: bb.colors.navGold, fontSize: 11, fontWeight: '900' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelHeadline: { color: bb.colors.text, fontFamily: bb.fonts.display, fontWeight: '900', fontSize: 15, textTransform: 'uppercase' },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: bb.radius.sm, backgroundColor: bb.colors.raised, borderWidth: 1, borderColor: bb.colors.border },
  streakFlame: { fontSize: 14 },
  streakCount: { color: bb.colors.title, fontWeight: '900', fontSize: 14 },
  xpBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpBarFlex: { flex: 1 },
  levelTick: { color: bb.colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  badgeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  badgeCount: { color: bb.colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  badgeRow: { gap: 12, paddingVertical: 2, paddingRight: 4 },
  badge: { width: 74, alignItems: 'center', gap: 6 },
  badgeMedal: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: bb.colors.raised, borderWidth: 2, borderColor: bb.colors.violet },
  badgeIcon: { color: bb.colors.violet, fontSize: 22, lineHeight: 26 },
  badgeName: { color: bb.colors.text, fontSize: 9, lineHeight: 12, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' },
  summaryRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  icon: { width: 54, height: 54, borderRadius: bb.radius.md, borderWidth: 1, borderColor: bb.colors.emerald, alignItems: 'center', justifyContent: 'center', backgroundColor: bb.colors.raised },
  iconText: { color: bb.colors.emerald, fontSize: 26 },
  amount: { color: bb.colors.text, fontWeight: '800', fontSize: 17 },
  cardTitle: { color: bb.colors.text, fontFamily: bb.fonts.display, fontWeight: '900', fontSize: 18, textTransform: 'uppercase' },
});
