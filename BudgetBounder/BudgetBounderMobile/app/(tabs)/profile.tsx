import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, PrimaryButton, Progress, Screen } from '@/src/components/BbUi';
import { bb } from '@/src/theme/tokens';
import { getXpProgress } from '@/src/progression/xpProgress';
import { router, type Href, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, refreshUser, signOut } = useAuth();
  useFocusEffect(useCallback(() => { void refreshUser().catch(() => undefined); }, [refreshUser]));
  if (!user) return null;
  const xp = getXpProgress(user.xp);
  return <Screen>
    <PixelLabel tone={bb.colors.emerald}>PLAYER CARD</PixelLabel><Text style={styles.title}>Profile</Text>
    <Card accent={bb.colors.emerald}><View style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{user.fullName.slice(0, 1).toUpperCase()}</Text></View><View style={styles.flex}><Text style={styles.name}>{user.fullName}</Text><Text style={styles.muted}>Level {user.level} · Expense Ranger</Text></View></View><Text style={styles.xpTotal}>{Math.round(user.xp)} TOTAL XP</Text><Progress value={xp.progress} /><Text style={styles.muted}>{xp.nextLevelAt == null ? 'Maximum level reached' : `${Math.round(xp.current)} / ${xp.required} XP in this level · next level at ${xp.nextLevelAt}`}</Text></Card>
    <View style={styles.grid}><Card style={styles.stat}><PixelLabel tone={bb.colors.gold}>STREAK</PixelLabel><Text style={styles.number}>{user.currentStreak}</Text><Text style={styles.muted}>days</Text></Card><Card style={styles.stat}><PixelLabel tone={bb.colors.violet}>ROLE</PixelLabel><Text style={styles.number}>●</Text><Text style={styles.muted}>Player</Text></Card></View>
    <Card><PixelLabel tone={bb.colors.cyan}>ACCOUNT & PRIVACY</PixelLabel><Text style={styles.muted}>{user.email}</Text><Text style={styles.muted}>Security · Notifications · AI data permissions · Accessibility</Text></Card>
    <PrimaryButton onPress={() => router.push('/reminders' as Href)}>SMART REMINDERS</PrimaryButton>
    <PrimaryButton onPress={() => router.push('/budget' as Href)}>MONTHLY BUDGET</PrimaryButton>
    <PrimaryButton onPress={signOut}>SIGN OUT</PrimaryButton>
  </Screen>;
}

const styles = StyleSheet.create({
  title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: bb.radius.md, backgroundColor: bb.colors.carbon, borderWidth: 2, borderColor: bb.colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: bb.colors.navGold, fontFamily: bb.fonts.display, fontSize: 24, fontWeight: '900' }, flex: { flex: 1 }, name: { color: bb.colors.text, fontFamily: bb.fonts.display, fontSize: 20, fontWeight: '900', textTransform: 'uppercase' },
  muted: { color: bb.colors.muted, fontSize: 12, lineHeight: 17 }, xpTotal: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 26, fontWeight: '900' },
  grid: { flexDirection: 'row', gap: 12 }, stat: { flex: 1 }, number: { color: bb.colors.text, fontSize: 30, fontWeight: '900' },
});
