import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, PrimaryButton, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb, formatIls } from '@/src/theme/tokens';
import type { Transaction } from '@/src/types/api';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export default function TransactionsScreen() {
  const { user } = useAuth(); const [items, setItems] = useState<Transaction[]>([]); const [error, setError] = useState('');
  const load = useCallback(() => { if (!user) return; setError(''); api.get<Transaction[]>(`/transactions/user/${user.id}`).then(response => setItems(response.data.sort((a, b) => b.date.localeCompare(a.date)))).catch(() => setError('Activity could not be loaded.')); }, [user]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() - 5 + i);
    const key = date.toISOString().slice(0, 7);
    const entries = items.filter(t => t.date.startsWith(key));
    return { key, expenses: entries.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0), income: entries.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0) };
  });
  const maximum = Math.max(1, ...months.map(m => m.expenses));
  function remove(item: Transaction) { Alert.alert('Delete transaction?', `${item.title} will be permanently removed.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await api.delete(`/transactions/${item.id}`); load(); } catch { setError('The transaction could not be deleted.'); } } }]); }
  function openLocation(item: Transaction) { if (item.latitude == null || item.longitude == null) return; void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`); }
  return <Screen><View style={styles.header}><View style={styles.flex}><PixelLabel tone={bb.colors.cyan}>FINANCE LOG</PixelLabel><Text style={styles.title}>Activity</Text><Text style={styles.muted}>Every entry strengthens your financial map.</Text></View><PrimaryButton onPress={() => router.push('/modal')}>+ ADD</PrimaryButton></View>
    {items.length ? <Card><PixelLabel>LAST SIX MONTHS</PixelLabel>{months.map(month => <View key={month.key}><Text style={styles.muted}>{month.key} · Expense {formatIls(month.expenses)} · Income {formatIls(month.income)}</Text><View style={{ height: 8, borderRadius: 4, backgroundColor: bb.colors.raised, marginTop: 5 }}><View style={{ height: 8, borderRadius: 4, backgroundColor: bb.colors.coral, width: ((month.expenses / maximum * 100) + '%') as `${number}%` }} /></View></View>)}</Card> : null}
    {error ? <StatePanel title="ACTIVITY ERROR" message={error} action={<PrimaryButton onPress={load}>TRY AGAIN</PrimaryButton>} /> : null}
    {!error && items.length === 0 ? <StatePanel title="NO TRANSACTIONS" message="Log your first expense or income to begin." action={<PrimaryButton onPress={() => router.push('/modal')}>ADD FIRST ENTRY</PrimaryButton>} /> : null}
    {items.map(item => <Card key={item.id}><View style={styles.row}><View style={[styles.icon, { borderColor: item.type === 'Income' ? bb.colors.emerald : bb.colors.coral }]}><Text style={styles.iconLetter}>{item.category.slice(0, 1).toUpperCase()}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.muted}>{item.category} · {new Date(item.date).toLocaleDateString('he-IL')}</Text></View><Text style={[styles.amount, { color: item.type === 'Income' ? bb.colors.emerald : bb.colors.text }]}>{item.type === 'Income' ? '+' : '−'}{formatIls(item.amount)}</Text></View>{item.receiptImageDataUrl ? <Image source={{ uri: item.receiptImageDataUrl }} accessibilityLabel={`Receipt for ${item.title}`} resizeMode="cover" style={styles.receipt} /> : null}<View style={styles.actions}>{item.receiptImageDataUrl ? <Text style={styles.badge}>📷 SAVED RECEIPT</Text> : null}{item.latitude != null ? <Pressable onPress={() => openLocation(item)}><Text style={styles.link}>⌖ {item.merchantAddress || 'VIEW LOCATION'}</Text></Pressable> : null}<Pressable onPress={() => remove(item)}><Text style={styles.delete}>DELETE</Text></Pressable></View></Card>)}
  </Screen>;
}
const styles = StyleSheet.create({ header: { flexDirection: 'row', gap: 12, alignItems: 'center' }, flex: { flex: 1, gap: 5 }, title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, muted: { color: bb.colors.muted, fontSize: 12, lineHeight: 17 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 40, height: 40, borderRadius: bb.radius.md, borderWidth: 1, borderColor: bb.colors.border, backgroundColor: bb.colors.raised, alignItems: 'center', justifyContent: 'center' }, iconLetter: { color: bb.colors.text }, cardTitle: { color: bb.colors.text, fontFamily: bb.fonts.display, fontWeight: '900', fontSize: 16, textTransform: 'uppercase' }, amount: { fontWeight: '900', fontSize: 14 }, receipt: { width: '100%', height: 180, borderRadius: bb.radius.lg, borderWidth: 1, borderColor: bb.colors.border, backgroundColor: bb.colors.raised }, actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 }, badge: { color: bb.colors.carbon, backgroundColor: bb.colors.gold, padding: 4, fontSize: 10, fontFamily: bb.fonts.body }, link: { color: bb.colors.cyan, fontSize: 11, fontFamily: bb.fonts.body }, delete: { color: bb.colors.coral, fontSize: 11, fontFamily: bb.fonts.body, fontWeight: '900' } });
