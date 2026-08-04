import { PixelLabel, PrimaryButton, Screen } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb } from '@/src/theme/tokens';
import { validatePositiveAmount } from '@/src/validation/financeForms';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

export default function ContributeGoalScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>(); const [amount, setAmount] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function save() { const validation = validatePositiveAmount(amount); if (validation) { setError(validation); return; } setSaving(true); setError(''); try { await api.put(`/savinggoals/${id}/progress`, null, { params: { amountToAdd: Number(amount) } }); router.back(); } catch { setError('The contribution was not saved. Try again.'); } finally { setSaving(false); } }
  return <Screen><PixelLabel tone={bb.colors.gold}>GOAL CONTRIBUTION</PixelLabel><Text style={styles.title}>{title}</Text><Text style={styles.muted}>Every contribution builds progress. Completing the goal earns XP.</Text><TextInput accessibilityLabel="Contribution amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="Amount to add" placeholderTextColor={bb.colors.muted} style={styles.input} />{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton loading={saving} onPress={save}>ADD TO GOAL</PrimaryButton></Screen>;
}
const styles = StyleSheet.create({ title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, muted: { color: bb.colors.muted, lineHeight: 18 }, input: { minHeight: 52, color: bb.colors.text, backgroundColor: bb.colors.raised, borderWidth: 1, borderTopColor: bb.colors.border, borderLeftColor: bb.colors.border, borderRightColor: bb.colors.bevelLight, borderBottomColor: bb.colors.bevelLight, borderRadius: bb.radius.md, paddingHorizontal: 12 }, error: { color: bb.colors.coral } });
