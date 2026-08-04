import { PixelLabel, PrimaryButton, Screen } from '@/src/components/BbUi';
import { useAuth } from '@/src/auth/AuthProvider';
import { toReceiptAttachment } from '@/src/receipts/receiptAsset';
import api from '@/src/services/api';
import { bb, formatIls } from '@/src/theme/tokens';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const categories = ['Food', 'Transport', 'Shopping', 'Health', 'Housing', 'Other'];

export default function AddTransactionModal() {
  const { refreshUser } = useAuth();
  const [amount, setAmount] = useState(''); const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food'); const [type, setType] = useState<'Expense' | 'Income'>('Expense');
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<{ uri: string; dataUrl: string } | null>(null);
  const [merchant, setMerchant] = useState<{ latitude: number; longitude: number; address: string } | null>(null);

  async function captureReceipt() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { setError('Camera permission was not granted. You can still save the transaction manually.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], base64: true, quality: 0.35 });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    const attachment = toReceiptAttachment(asset);
    if (attachment) setReceipt(attachment); else setError('The camera image could not be prepared. Try again.');
  }

  async function chooseReceipt() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setError('Photo-library permission was not granted. You can still save without a receipt.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.35 });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    const attachment = toReceiptAttachment(asset);
    if (attachment) setReceipt(attachment); else setError('The selected image could not be prepared. Try another photo.');
  }

  async function tagLocation() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) { setError('Location permission was not granted. Location tagging is optional.'); return; }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const places = await Location.reverseGeocodeAsync(position.coords);
    const place = places[0];
    const address = place ? [place.name, place.street, place.city].filter(Boolean).filter((item, index, all) => all.indexOf(item) === index).join(', ') : 'Current location';
    setMerchant({ latitude: position.coords.latitude, longitude: position.coords.longitude, address });
  }

  async function save() {
    const value = Number(amount);
    if (!value || value <= 0) { setError('Enter an amount greater than zero.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/transactions', {
        amount: value, title: title.trim() || type, category, type, date: new Date().toISOString(),
        receiptImageDataUrl: receipt?.dataUrl, latitude: merchant?.latitude, longitude: merchant?.longitude, merchantAddress: merchant?.address,
      });
      void refreshUser().catch(() => undefined);
      router.back();
    } catch { setError('The transaction was not saved. Check your connection and try again.'); }
    finally { setSaving(false); }
  }

  return <Screen>
    <PixelLabel tone={type === 'Expense' ? bb.colors.coral : bb.colors.emerald}>QUICK ENTRY</PixelLabel><Text style={styles.title}>Add transaction</Text>
    <View style={styles.toggle}><Pressable onPress={() => setType('Expense')} style={[styles.toggleItem, type === 'Expense' && styles.active]}><Text style={styles.toggleText}>Expense</Text></Pressable><Pressable onPress={() => setType('Income')} style={[styles.toggleItem, type === 'Income' && styles.active]}><Text style={styles.toggleText}>Income</Text></Pressable></View>
    <Text style={styles.amountPreview}>{formatIls(Number(amount) || 0)}</Text>
    <TextInput accessibilityLabel="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={bb.colors.muted} style={styles.input} />
    <TextInput accessibilityLabel="Merchant or description" value={title} onChangeText={setTitle} placeholder="Merchant or description" placeholderTextColor={bb.colors.muted} style={styles.input} />
    <PixelLabel tone={bb.colors.cyan}>CATEGORY</PixelLabel><View style={styles.categories}>{categories.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}><Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text></Pressable>)}</View>
    <PixelLabel tone={bb.colors.violet}>NATIVE TOOLS</PixelLabel>
    <View style={styles.toolRow}><Pressable accessibilityRole="button" onPress={captureReceipt} style={styles.tool}><Text style={styles.toolTitle}>📷 Capture receipt</Text><Text style={styles.toolCopy}>Take a new camera photo</Text></Pressable><Pressable accessibilityRole="button" onPress={chooseReceipt} style={styles.tool}><Text style={styles.toolTitle}>▣ Choose from gallery</Text><Text style={styles.toolCopy}>Select an existing receipt photo</Text></Pressable><Pressable accessibilityRole="button" onPress={tagLocation} style={styles.tool}><Text style={styles.toolTitle}>{merchant ? '✓ Location tagged' : '⌖ Tag merchant'}</Text><Text style={styles.toolCopy}>{merchant?.address ?? 'Foreground location only'}</Text></Pressable></View>
    {receipt ? <Image source={{ uri: receipt.uri }} accessibilityLabel="Receipt preview" style={styles.receipt} /> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton loading={saving} onPress={save}>SAVE & EARN 10 XP</PrimaryButton>
  </Screen>;
}

const styles = StyleSheet.create({
  title: { color: bb.colors.title, fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900', textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, textTransform: 'uppercase' }, toggle: { flexDirection: 'row', backgroundColor: bb.colors.carbon, borderRadius: bb.radius.lg, padding: 4 },
  toggleItem: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: bb.radius.sm }, active: { backgroundColor: bb.colors.chromeSoft, borderWidth: 1, borderColor: bb.colors.navGold }, toggleText: { color: bb.colors.title, fontFamily: bb.fonts.body, fontWeight: '900' },
  amountPreview: { color: bb.colors.text, fontFamily: bb.fonts.display, fontSize: 40, fontWeight: '900', textAlign: 'center', marginVertical: 6 }, input: { minHeight: 52, color: bb.colors.text, backgroundColor: bb.colors.raised, borderWidth: 2, borderTopColor: bb.colors.border, borderLeftColor: bb.colors.border, borderRightColor: bb.colors.bevelLight, borderBottomColor: bb.colors.bevelLight, borderRadius: bb.radius.sm, paddingHorizontal: 12 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: bb.colors.border, backgroundColor: bb.colors.surface }, chipActive: { borderColor: bb.colors.cyan, backgroundColor: bb.colors.raised }, chipText: { color: bb.colors.muted }, chipTextActive: { color: bb.colors.cyan },
  toolRow: { gap: 8 }, tool: { borderWidth: 2, borderTopColor: bb.colors.raised, borderLeftColor: bb.colors.raised, borderRightColor: bb.colors.border, borderBottomColor: bb.colors.border, borderRadius: bb.radius.sm, padding: 12, backgroundColor: bb.colors.surface, gap: 4 }, toolTitle: { color: bb.colors.text, fontFamily: bb.fonts.body, fontWeight: '900' }, toolCopy: { color: bb.colors.muted, fontSize: 12 }, receipt: { width: '100%', height: 180, borderRadius: bb.radius.md, borderWidth: 2, borderColor: bb.colors.border }, error: { color: bb.colors.coral },
});
