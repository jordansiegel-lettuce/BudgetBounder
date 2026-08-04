import { PixelLabel, PrimaryButton, Screen } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb } from '@/src/theme/tokens';
import { validatePositiveAmount } from '@/src/validation/financeForms';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

export default function BudgetScreen() {
  const [amount, setAmount] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function save() { const validation = validatePositiveAmount(amount); if (validation) { setError(validation); return; } const now = new Date(); setSaving(true); setError(''); try { await api.put(`/budgets/me/${now.getFullYear()}/${now.getMonth() + 1}`, { amount: Number(amount) }); router.back(); } catch { setError('The monthly budget was not saved. Try again.'); } finally { setSaving(false); } }
  return <Screen><PixelLabel tone={bb.colors.emerald}>MONTHLY PLAN</PixelLabel><Text style={styles.title}>Set this month&apos;s budget</Text><Text style={styles.muted}>Smart reminders use this limit to warn you before overspending.</Text><TextInput accessibilityLabel="Monthly budget" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="Monthly budget" placeholderTextColor={bb.colors.muted} style={styles.input} />{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton loading={saving} onPress={save}>SAVE BUDGET</PrimaryButton></Screen>;
}
const styles = StyleSheet.create({ title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, muted: { color: bb.colors.muted, lineHeight: 18 }, input: { minHeight: 52, color: bb.colors.text, backgroundColor: bb.colors.raised, borderWidth: 1, borderTopColor: bb.colors.border, borderLeftColor: bb.colors.border, borderRightColor: bb.colors.bevelLight, borderBottomColor: bb.colors.bevelLight, borderRadius: bb.radius.md, paddingHorizontal: 12 }, error: { color: bb.colors.coral } });
