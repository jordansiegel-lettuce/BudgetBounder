import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, PrimaryButton, Progress, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb } from '@/src/theme/tokens';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Mission = { id: number; title: string; description: string; difficulty: string; xpReward: number; currentProgress: number; targetValue: number; isAiGenerated: boolean; isCompleted?: boolean; expiresAt: string };
export default function MissionsScreen() {
  const { user } = useAuth(); const [items, setItems] = useState<Mission[]>([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  const load = useCallback(() => { if (!user) return; setError(''); api.get<Mission[]>(`/missions/user/${user.id}`).then(r => setItems(r.data)).catch(() => setError('Mission board could not be loaded.')); }, [user]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function generate() { if (!user) return; setBusy(true); setError(''); try { await api.post(`/missions/generate/${user.id}`); setNotice('Your personalized missions are awaiting admin review. Approved quests will appear here.'); load(); } catch { setError('Personalized missions could not be generated right now.'); } finally { setBusy(false); } }
  async function complete(id: number) { setBusy(true); setError(''); try { await api.post(`/missions/${id}/complete`); load(); } catch { setError('This mission is not ready to complete.'); } finally { setBusy(false); } }
  return <Screen><View style={styles.header}><View style={styles.flex}><PixelLabel tone={bb.colors.gold}>QUEST BOARD</PixelLabel><Text style={styles.title}>Missions</Text></View><PrimaryButton loading={busy} onPress={generate}>AI QUESTS</PrimaryButton></View><Text style={styles.muted}>Rewards reinforce logging, saving, planning and learning—not spending.</Text>
    {notice ? <StatePanel title="AWAITING REVIEW" message={notice} /> : null}
    {error ? <StatePanel title="MISSION LINK ERROR" message={error} action={<PrimaryButton onPress={load}>TRY AGAIN</PrimaryButton>} /> : null}
    {!error && items.length === 0 ? <StatePanel title="BOARD CLEAR" message="Generate personalized quests after adding financial activity." action={<PrimaryButton onPress={generate}>GENERATE QUESTS</PrimaryButton>} /> : null}
    {items.map(mission => <Card key={mission.id} accent={mission.isCompleted ? bb.colors.emerald : mission.isAiGenerated ? bb.colors.violet : bb.colors.gold}><View style={styles.row}><PixelLabel tone={mission.isCompleted ? bb.colors.emerald : mission.isAiGenerated ? bb.colors.violet : bb.colors.gold}>{mission.isCompleted ? 'COMPLETED TODAY' : mission.isAiGenerated ? 'NOVA PERSONALIZED' : mission.difficulty}</PixelLabel><Text style={styles.xp}>{mission.isCompleted ? '✓ ' : '+'}{mission.xpReward} XP</Text></View><Text style={styles.cardTitle}>{mission.title}</Text><Text style={styles.muted}>{mission.description}</Text><Progress value={mission.targetValue ? mission.currentProgress / mission.targetValue : 0} tone={mission.isCompleted ? bb.colors.emerald : mission.isAiGenerated ? bb.colors.violet : bb.colors.gold} /><Text style={styles.meta}>{mission.currentProgress} / {mission.targetValue} · {mission.isCompleted ? 'reward added' : `expires ${new Date(mission.expiresAt).toLocaleDateString('he-IL')}`}</Text>{!mission.isCompleted && mission.currentProgress >= mission.targetValue ? <PrimaryButton loading={busy} onPress={() => complete(mission.id)}>CLAIM XP</PrimaryButton> : null}</Card>)}
  </Screen>;
}
const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, flex: { flex: 1 }, title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, muted: { color: bb.colors.muted, fontSize: 12, lineHeight: 17 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, xp: { color: bb.colors.navGold, fontWeight: '900' }, cardTitle: { color: bb.colors.text, fontFamily: bb.fonts.display, fontSize: 18, fontWeight: '900', textTransform: 'uppercase' }, meta: { color: bb.colors.muted, fontFamily: bb.fonts.body, fontSize: 10 } });
