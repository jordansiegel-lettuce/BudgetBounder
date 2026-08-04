import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, PrimaryButton, Progress, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb, formatIls } from '@/src/theme/tokens';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Goal = { id: number; title: string; targetAmount: number; currentAmount: number; deadline: string; isCompleted: boolean };
export default function GoalsScreen() {
  const { user } = useAuth(); const [items, setItems] = useState<Goal[]>([]); const [error, setError] = useState('');
  const load = useCallback(() => { if (!user) return; setError(''); api.get<Goal[]>(`/savinggoals/user/${user.id}`).then(r => setItems(r.data)).catch(() => setError('Savings goals could not be loaded.')); }, [user]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const total = items.reduce((sum, goal) => sum + goal.currentAmount, 0);
  return <Screen><View style={styles.header}><View style={styles.flex}><PixelLabel tone={bb.colors.cyan}>SAVINGS VAULTS</PixelLabel><Text style={styles.title}>Goals</Text></View><PrimaryButton onPress={() => router.push('/create-goal' as Href)}>+ NEW</PrimaryButton></View>
    <Card accent={bb.colors.gold}><Text style={styles.muted}>Total protected</Text><Text style={styles.total}>{formatIls(total)}</Text><Text style={styles.muted}>Saving progress earns XP when healthy milestones are completed.</Text></Card>
    {error ? <StatePanel title="VAULT ERROR" message={error} action={<PrimaryButton onPress={load}>TRY AGAIN</PrimaryButton>} /> : null}
    {!error && items.length === 0 ? <StatePanel title="NO ACTIVE VAULTS" message="Create your first savings goal and choose a realistic deadline." action={<PrimaryButton onPress={() => router.push('/create-goal' as Href)}>CREATE GOAL</PrimaryButton>} /> : null}
    {items.map(goal => <Card key={goal.id} accent={goal.isCompleted ? bb.colors.emerald : undefined}><View style={styles.row}><Text style={styles.cardTitle}>{goal.title}</Text><Text style={styles.reward}>{goal.isCompleted ? 'COMPLETE' : new Date(goal.deadline).toLocaleDateString('he-IL')}</Text></View><Text style={styles.muted}>{formatIls(goal.currentAmount)} of {formatIls(goal.targetAmount)}</Text><Progress value={goal.targetAmount ? goal.currentAmount / goal.targetAmount : 0} tone={goal.isCompleted ? bb.colors.emerald : bb.colors.cyan} />{!goal.isCompleted ? <PrimaryButton onPress={() => router.push({ pathname: '/contribute-goal', params: { id: goal.id, title: goal.title } } as unknown as Href)}>ADD CONTRIBUTION</PrimaryButton> : null}</Card>)}
  </Screen>;
}
const styles = StyleSheet.create({ header: { flexDirection: 'row', gap: 12, alignItems: 'center' }, flex: { flex: 1, gap: 5 }, title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, total: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 34, fontWeight: '900' }, muted: { color: bb.colors.muted, fontSize: 12, lineHeight: 17 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, cardTitle: { color: bb.colors.text, fontFamily: bb.fonts.display, fontSize: 17, fontWeight: '900', flex: 1, textTransform: 'uppercase' }, reward: { color: bb.colors.navGold, fontFamily: bb.fonts.body, fontWeight: '900', fontSize: 10 } });
