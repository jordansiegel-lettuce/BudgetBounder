import { bb } from '@/src/theme/tokens';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function PixelLabel({ children, tone = bb.colors.emerald }: PropsWithChildren<{ tone?: string }>) {
  return <Text style={[styles.pixelLabel, { color: tone }]}>{children}</Text>;
}

export function Card({ children, accent, style }: PropsWithChildren<{ accent?: string; style?: ViewStyle }>) {
  return <View style={[styles.card, accent ? { borderColor: accent } : null, style]}>{children}</View>;
}

export function PrimaryButton({ children, loading, ...props }: PressableProps & { children: ReactNode; loading?: boolean }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={loading || props.disabled} {...props}>
      {loading ? <ActivityIndicator color={bb.colors.canvas} /> : <Text style={styles.buttonText}>{children}</Text>}
    </Pressable>
  );
}

export function Progress({ value, tone = bb.colors.emerald }: { value: number; tone?: string }) {
  const normalized = Math.min(1, Math.max(0, value));
  return <View style={styles.track}><View style={[styles.progress, { width: `${normalized * 100}%`, backgroundColor: tone }]} /></View>;
}

export function StatePanel({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <Card><PixelLabel tone={bb.colors.coral}>{title}</PixelLabel><Text style={styles.muted}>{message}</Text>{action}</Card>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: bb.colors.canvas },
  screen: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 112, gap: 20 },
  card: { backgroundColor: bb.colors.surface, borderWidth: 1, borderColor: bb.colors.border, borderRadius: bb.radius.xl, padding: 18, gap: 14 },
  pixelLabel: { fontFamily: 'monospace', fontWeight: '800', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  muted: { color: bb.colors.muted, fontSize: 14, lineHeight: 21 },
  button: { minHeight: 48, paddingHorizontal: 18, borderRadius: bb.radius.md, backgroundColor: bb.colors.emerald, alignItems: 'center', justifyContent: 'center' },
  buttonPressed: { opacity: 0.78 },
  buttonText: { color: bb.colors.canvas, fontFamily: 'monospace', fontWeight: '900', fontSize: 12, letterSpacing: 0.3 },
  track: { height: 10, borderRadius: 5, backgroundColor: bb.colors.raised, borderColor: bb.colors.border, borderWidth: 1, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 5 },
});

export const ui = styles;
