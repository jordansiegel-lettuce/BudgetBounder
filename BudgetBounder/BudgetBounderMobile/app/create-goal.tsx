import { PixelLabel, PrimaryButton, Screen } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb } from '@/src/theme/tokens';
import { validateGoal } from '@/src/validation/financeForms';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

export default function CreateGoalScreen() {
  const [title, setTitle] = useState(''); const [target, setTarget] = useState(''); const [deadline, setDeadline] = useState('');
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function save() {
    const validation = validateGoal(title, target, deadline);
    if (validation) { setError(validation); return; }
    setSaving(true); setError('');
    try { await api.post('/savinggoals', { title: title.trim(), targetAmount: Number(target), currentAmount: 0, deadline: new Date(`${deadline}T23:59:59`).toISOString(), isCompleted: false }); router.back(); }
    catch { setError('The savings goal was not created. Try again.'); }
    finally { setSaving(false); }
  }
  return <Screen><PixelLabel tone={bb.colors.cyan}>NEW SAVINGS VAULT</PixelLabel><Text style={styles.title}>Create a goal</Text><Text style={styles.muted}>Choose a clear target and a realistic future date.</Text><TextInput accessibilityLabel="Goal name" value={title} onChangeText={setTitle} placeholder="Goal name" placeholderTextColor={bb.colors.muted} style={styles.input} /><TextInput accessibilityLabel="Target amount" keyboardType="decimal-pad" value={target} onChangeText={setTarget} placeholder="Target amount" placeholderTextColor={bb.colors.muted} style={styles.input} /><TextInput accessibilityLabel="Deadline" value={deadline} onChangeText={setDeadline} placeholder="Deadline: YYYY-MM-DD" placeholderTextColor={bb.colors.muted} style={styles.input} />{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton loading={saving} onPress={save}>CREATE GOAL</PrimaryButton></Screen>;
}
const styles = StyleSheet.create({ title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, muted: { color: bb.colors.muted, lineHeight: 18 }, input: { minHeight: 52, color: bb.colors.text, backgroundColor: bb.colors.raised, borderWidth: 1, borderTopColor: bb.colors.border, borderLeftColor: bb.colors.border, borderRightColor: bb.colors.bevelLight, borderBottomColor: bb.colors.bevelLight, borderRadius: bb.radius.md, paddingHorizontal: 12 }, error: { color: bb.colors.coral } });
