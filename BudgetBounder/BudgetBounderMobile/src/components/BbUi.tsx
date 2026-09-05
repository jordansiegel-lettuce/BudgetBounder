import { bb } from '@/src/theme/tokens';
import { useEffect, useState, type PropsWithChildren, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

export function Screen({ children }: PropsWithChildren) {
  const [entrance] = useState(() => new Animated.Value(1));
  const [drift] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    entrance.stopAnimation();
    drift.stopAnimation();
    if (reduceMotion) {
      entrance.setValue(1);
      drift.setValue(0.5);
      return;
    }

    entrance.setValue(0);
    const entranceAnimation = Animated.timing(entrance, {
      toValue: 1,
      duration: bb.motion.entranceDurationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const driftAnimation = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: bb.motion.driftDurationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: bb.motion.driftDurationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    entranceAnimation.start();
    driftAnimation.start();
    return () => {
      entranceAnimation.stop();
      driftAnimation.stop();
    };
  }, [drift, entrance, reduceMotion]);

  const floatY = drift.interpolate({ inputRange: [0, 1], outputRange: [-bb.motion.driftDistance, bb.motion.driftDistance] });
  const floatX = drift.interpolate({ inputRange: [0, 1], outputRange: [bb.motion.driftDistance / 2, -bb.motion.driftDistance / 2] });

  return (
    <SafeAreaView style={styles.safe}>
      <View pointerEvents="none" style={styles.ambientLayer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Animated.View style={[styles.floatBox, styles.floatBoxOne, { transform: [{ translateY: floatY }, { rotate: '-8deg' }] }]} />
        <Animated.View style={[styles.floatBox, styles.floatBoxTwo, { transform: [{ translateX: floatX }, { rotate: '12deg' }] }]} />
        <Animated.View style={[styles.floatBox, styles.floatBoxThree, { transform: [{ translateY: floatY }, { translateX: floatX }, { rotate: '5deg' }] }]} />
      </View>
      <Animated.ScrollView
        contentContainerStyle={styles.screen}
        showsVerticalScrollIndicator={false}
        style={{ opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
        <ChromeHeader />
        {children}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function ChromeHeader() {
  return <View style={styles.chromeShell}>
    <View style={styles.masthead}>
      <View style={styles.logoPill}><Text style={styles.logoText}>BUDGET BOUNDER</Text></View>
      <View style={styles.welcomePlate}><Text style={styles.welcomeText}>YOUR MONEY CONSOLE</Text></View>
    </View>
    <View style={styles.commandBar}>
      {['COINS', 'VAULT', 'QUESTS', 'XP'].map(item => <Text key={item} style={styles.commandText}>{item}</Text>)}
    </View>
    <View style={styles.subnav}>
      <Text style={styles.subnavText}>PLAN</Text><Text style={styles.subnavText}>SAVE</Text><Text style={styles.subnavText}>LEVEL UP</Text>
    </View>
  </View>;
}

export function PixelLabel({ children, tone = bb.colors.emerald }: PropsWithChildren<{ tone?: string }>) {
  return <Text style={[styles.pixelLabel, { borderLeftColor: tone }]}>{children}</Text>;
}

export function Card({ children, accent, style }: PropsWithChildren<{ accent?: string; style?: ViewStyle }>) {
  return <View style={[styles.card, accent ? { borderRightColor: accent, borderRightWidth: 5 } : null, style]}>{children}</View>;
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
  safe: { flex: 1, backgroundColor: bb.colors.canvas, overflow: 'hidden' },
  ambientLayer: { ...StyleSheet.absoluteFill },
  floatBox: { position: 'absolute', borderWidth: 1, borderColor: bb.colors.border, borderRadius: bb.radius.xl },
  floatBoxOne: { width: 112, height: 112, top: '12%', right: -32, backgroundColor: bb.colors.floatBlue },
  floatBoxTwo: { width: 76, height: 76, top: '45%', left: -24, backgroundColor: bb.colors.floatGold },
  floatBoxThree: { width: 142, height: 86, bottom: '9%', right: -46, backgroundColor: bb.colors.floatBlue },
  screen: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 112, gap: 12 },
  chromeShell: { borderWidth: 1, borderTopColor: bb.colors.bevelLight, borderLeftColor: bb.colors.bevelLight, borderRightColor: bb.colors.border, borderBottomColor: bb.colors.border, borderRadius: bb.radius.xl, overflow: 'hidden', shadowColor: '#000000', shadowOpacity: 0.24, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  masthead: { minHeight: 50, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: bb.colors.chromeSoft },
  logoPill: { backgroundColor: bb.colors.raised, borderColor: bb.colors.coral, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  logoText: { color: bb.colors.coral, fontFamily: bb.fonts.display, fontWeight: '900', fontSize: 14, letterSpacing: -0.3 },
  welcomePlate: { backgroundColor: bb.colors.raised, borderWidth: 1, borderColor: bb.colors.border, borderRadius: bb.radius.lg, paddingHorizontal: 8, paddingVertical: 6, flexShrink: 1 },
  welcomeText: { color: bb.colors.title, fontFamily: bb.fonts.body, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  commandBar: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: bb.colors.carbon, paddingHorizontal: 8, paddingVertical: 8 },
  commandText: { color: bb.colors.navGold, fontFamily: bb.fonts.body, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  subnav: { minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: bb.colors.chromeSoft, paddingVertical: 5 },
  subnavText: { color: bb.colors.title, fontFamily: bb.fonts.body, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  card: { backgroundColor: bb.colors.surface, borderWidth: 1, borderTopColor: bb.colors.bevelLight, borderLeftColor: bb.colors.bevelLight, borderRightColor: bb.colors.border, borderBottomColor: bb.colors.border, borderRadius: bb.radius.xl, padding: 12, gap: 12, shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  pixelLabel: { alignSelf: 'stretch', backgroundColor: bb.colors.chromeSoft, borderLeftWidth: 7, borderBottomColor: bb.colors.border, borderBottomWidth: 1, borderRadius: bb.radius.sm, overflow: 'hidden', color: bb.colors.title, fontFamily: bb.fonts.body, fontWeight: '900', fontSize: 11, letterSpacing: 0.5, paddingHorizontal: 8, paddingVertical: 7, textTransform: 'uppercase' },
  muted: { color: bb.colors.muted, fontFamily: bb.fonts.body, fontSize: 12, lineHeight: 17 },
  button: { minHeight: 48, paddingHorizontal: 16, borderRadius: bb.radius.lg, borderWidth: 1, borderTopColor: '#FFD08A', borderLeftColor: '#FFD08A', borderRightColor: '#A94E00', borderBottomColor: '#A94E00', backgroundColor: bb.colors.emerald, alignItems: 'center', justifyContent: 'center', shadowColor: '#000000', shadowOpacity: 0.22, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  buttonPressed: { backgroundColor: bb.colors.navGold },
  buttonText: { color: bb.colors.carbon, fontFamily: bb.fonts.body, fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  track: { height: 12, borderRadius: 999, backgroundColor: bb.colors.raised, borderColor: bb.colors.border, borderWidth: 1, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 999 },
});

export const ui = styles;
