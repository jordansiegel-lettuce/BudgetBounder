import { PrimaryButton, Screen } from '@/src/components/BbUi';
import { useAuth } from '@/src/auth/AuthProvider';
import { bb } from '@/src/theme/tokens';
import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setSubmitting(true); setError('');
    try { await signIn(email.trim(), password); }
    catch { setError('We could not sign you in. Check your details and try again.'); }
    finally { setSubmitting(false); }
  }

  return <Screen>
    <View style={styles.brand}><Text style={styles.logo}>BUDGET{'\n'}BOUNDER</Text><Text style={styles.tagline}>LEVEL UP YOUR MONEY</Text></View>
    <View style={styles.form}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.copy}>Your progress is waiting in the vault.</Text>
      <TextInput accessibilityLabel="Email" autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={bb.colors.muted} value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput accessibilityLabel="Password" secureTextEntry placeholder="Password" placeholderTextColor={bb.colors.muted} value={password} onChangeText={setPassword} style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton loading={submitting} onPress={submit}>ENTER THE VAULT</PrimaryButton>
      <Link href={'/register' as Href} style={styles.link}>Create a new account</Link>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  brand: { minHeight: 250, justifyContent: 'center', gap: 18 },
  logo: { color: bb.colors.title, fontFamily: bb.fonts.display, fontWeight: '900', fontSize: 36, lineHeight: 40, textShadowColor: bb.colors.border, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2 },
  tagline: { color: bb.colors.navGold, fontFamily: bb.fonts.body, letterSpacing: 1, fontWeight: '900', backgroundColor: bb.colors.carbon, padding: 8 },
  form: { backgroundColor: bb.colors.surface, borderRadius: bb.radius.xl, borderWidth: 2, borderTopColor: bb.colors.raised, borderLeftColor: bb.colors.raised, borderRightColor: bb.colors.border, borderBottomColor: bb.colors.border, padding: 16, gap: 12 },
  title: { color: bb.colors.text, fontFamily: bb.fonts.display, fontSize: 26, fontWeight: '900', textTransform: 'uppercase' },
  copy: { color: bb.colors.muted, lineHeight: 21 },
  input: { minHeight: 50, color: bb.colors.text, fontFamily: bb.fonts.body, backgroundColor: bb.colors.raised, borderWidth: 2, borderTopColor: bb.colors.border, borderLeftColor: bb.colors.border, borderRightColor: bb.colors.bevelLight, borderBottomColor: bb.colors.bevelLight, borderRadius: bb.radius.sm, paddingHorizontal: 12 },
  error: { color: bb.colors.coral, lineHeight: 20 },
  link: { color: bb.colors.cyan, textAlign: 'center', padding: 8 },
});
