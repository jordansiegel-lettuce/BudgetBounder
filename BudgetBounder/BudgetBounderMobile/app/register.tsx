import { useAuth } from '@/src/auth/AuthProvider';
import { PrimaryButton, Screen } from '@/src/components/BbUi';
import { bb } from '@/src/theme/tokens';
import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit() {
    setSubmitting(true); setError('');
    try { await register(fullName.trim(), email.trim(), password); }
    catch { setError('That account could not be created. Check each field and try again.'); }
    finally { setSubmitting(false); }
  }
  return <Screen><View style={styles.form}>
    <Text style={styles.eyebrow}>NEW PLAYER</Text><Text style={styles.title}>Create your account</Text>
    <Text style={styles.copy}>Secure your finance quests and progress across devices.</Text>
    <TextInput accessibilityLabel="Full name" placeholder="Full name" placeholderTextColor={bb.colors.muted} value={fullName} onChangeText={setFullName} style={styles.input} />
    <TextInput accessibilityLabel="Email" autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={bb.colors.muted} value={email} onChangeText={setEmail} style={styles.input} />
    <TextInput accessibilityLabel="Password" secureTextEntry placeholder="Password" placeholderTextColor={bb.colors.muted} value={password} onChangeText={setPassword} style={styles.input} />
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <PrimaryButton loading={submitting} onPress={submit}>CREATE ACCOUNT</PrimaryButton>
    <Link href={'/sign-in' as Href} style={styles.link}>Already have an account?</Link>
  </View></Screen>;
}
const styles = StyleSheet.create({
  form: { marginTop: 64, backgroundColor: bb.colors.surface, borderRadius: bb.radius.xl, borderWidth: 1, borderColor: bb.colors.border, padding: 20, gap: 14 },
  eyebrow: { color: bb.colors.gold, fontFamily: 'monospace', fontWeight: '900', letterSpacing: 1.5 },
  title: { color: bb.colors.text, fontSize: 27, fontWeight: '800' },
  copy: { color: bb.colors.muted, lineHeight: 21 },
  input: { minHeight: 50, color: bb.colors.text, backgroundColor: bb.colors.raised, borderWidth: 1, borderColor: bb.colors.border, borderRadius: bb.radius.md, paddingHorizontal: 15 },
  error: { color: bb.colors.coral }, link: { color: bb.colors.cyan, textAlign: 'center', padding: 8 },
});
