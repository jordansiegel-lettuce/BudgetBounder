import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ScreenScaffoldProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}>;

export function ScreenScaffold({ title, eyebrow, action, children }: ScreenScaffoldProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <ChromeDots />
          <View style={[styles.masthead, { borderColor: palette.bevelDark }]}>
            <View style={[styles.logoPill, { borderColor: palette.danger }]}>
              <ThemedText style={[styles.logoText, { color: palette.danger }]}>BudgetBounder</ThemedText>
            </View>
            <View style={[styles.mascotBubble, { borderColor: palette.bevelDark }]}>
              <ThemedText style={styles.bubbleText}>Welcome, Player!</ThemedText>
            </View>
          </View>
          <View style={[styles.commandBar, { backgroundColor: palette.carbon }]}>
            <HalftoneDots />
            {['Coins', 'Vault', 'Quests', 'XP'].map((item) => (
              <ThemedText key={item} style={[styles.navWord, { color: palette.navGold }]}>
                {item}
              </ThemedText>
            ))}
          </View>
          <View style={[styles.subnavStrip, { backgroundColor: palette.chromeSoft }]}>
            <ThemedText style={styles.subnavText}>AI MISSIONS</ThemedText>
            <ThemedText style={styles.subnavText}>STREAKS</ThemedText>
            <ThemedText style={styles.subnavText}>REWARDS</ThemedText>
          </View>
          <View style={styles.header}>
            <View style={styles.headerText}>
              {eyebrow ? (
                <ThemedText style={[styles.eyebrow, { color: palette.mutedText }]}>
                  {eyebrow}
                </ThemedText>
              ) : null}
              <ThemedText type="title" style={styles.title}>
                {title}
              </ThemedText>
            </View>
            {action}
          </View>
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

export function Section({
  title,
  children,
  trailing,
}: PropsWithChildren<{ title: string; trailing?: ReactNode }>) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View style={[styles.section, { borderColor: palette.bevelDark, backgroundColor: palette.chrome }]}>
      <View style={[styles.sectionHeader, { borderBottomColor: palette.bevelDark }]}>
        <View style={[styles.sectionGlyph, { backgroundColor: palette.carbon }]} />
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {title}
        </ThemedText>
        {trailing}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function ProgressBar({ progress, color }: { progress: number; color?: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  return (
    <View style={[styles.progressTrack, { backgroundColor: palette.surface, borderColor: palette.bevelDark }]}>
      <View
        style={[
          styles.progressFill,
          { backgroundColor: color ?? palette.tint, width: `${clampedProgress * 100}%` },
        ]}
      />
    </View>
  );
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const color = tone === 'success' ? palette.success : tone === 'warning' ? palette.amber : palette.accent;

  return (
    <View style={[styles.pill, { backgroundColor: color, borderColor: palette.bevelDark }]}>
      <ThemedText style={[styles.pillText, { color: tone === 'success' ? palette.surface : palette.carbon }]}>
        {label}
      </ThemedText>
    </View>
  );
}

export function HeroPlate({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle: string }>) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View style={[styles.heroPlate, { backgroundColor: palette.lavender, borderColor: palette.bevelDark }]}>
      <ChromeCircuit />
      <View style={styles.heroCopy}>
        <ThemedText style={[styles.heroWordmark, { color: palette.surface }]}>{title}</ThemedText>
        <ThemedText style={[styles.heroSubtitle, { color: palette.carbon }]}>{subtitle}</ThemedText>
      </View>
      {children}
    </View>
  );
}

function ChromeDots() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View pointerEvents="none" style={styles.backdrop}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
        <View
          key={index}
          style={[
            styles.chromeDot,
            {
              backgroundColor: palette.bevelLight,
              left: `${(index * 19 + 4) % 88}%`,
              opacity: 0.35,
              top: 22 + index * 48,
            },
          ]}
        />
      ))}
    </View>
  );
}

function HalftoneDots() {
  return (
    <View pointerEvents="none" style={styles.halftone}>
      {Array.from({ length: 30 }).map((_, index) => (
        <View key={index} style={styles.halftoneDot} />
      ))}
    </View>
  );
}

function ChromeCircuit() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View pointerEvents="none" style={styles.circuitLayer}>
      {[0, 1, 2, 3].map((index) => (
        <View
          key={index}
          style={[
            styles.circuitLine,
            {
              backgroundColor: index % 2 === 0 ? palette.chromeSoft : palette.bevelDark,
              left: 18 + index * 42,
              top: 16 + index * 21,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 120,
    paddingTop: 10,
    position: 'relative',
  },
  masthead: {
    alignItems: 'center',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    padding: 8,
  },
  logoPill: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  logoText: {
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 20,
  },
  mascotBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 2,
    flexShrink: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  bubbleText: {
    color: '#21242e',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  commandBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-around',
    minHeight: 31,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'relative',
  },
  navWord: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  subnavStrip: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 23,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  subnavText: {
    color: '#21242e',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 4,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 37,
    fontWeight: '900',
    lineHeight: 38,
    textShadowColor: '#3d4f97',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    textTransform: 'uppercase',
  },
  section: {
    borderWidth: 2,
    gap: 12,
    padding: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    borderBottomWidth: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    marginHorizontal: -8,
    marginTop: -8,
    padding: 8,
  },
  sectionGlyph: {
    height: 12,
    width: 12,
  },
  sectionTitle: {
    color: '#21242e',
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 4,
    borderWidth: 2,
    gap: 12,
    padding: 12,
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
  },
  progressTrack: {
    borderRadius: 0,
    borderWidth: 1,
    height: 14,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 0,
    height: '100%',
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 2,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  chromeDot: {
    borderRadius: 999,
    height: 3,
    position: 'absolute',
    width: 3,
  },
  halftone: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    opacity: 0.3,
    padding: 5,
  },
  halftoneDot: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    height: 2,
    width: 2,
  },
  heroPlate: {
    borderRadius: 6,
    borderWidth: 2,
    gap: 12,
    minHeight: 150,
    overflow: 'hidden',
    padding: 14,
    position: 'relative',
  },
  heroCopy: {
    gap: 4,
  },
  heroWordmark: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 35,
    textShadowColor: '#21242e',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },
  circuitLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.38,
  },
  circuitLine: {
    height: 3,
    position: 'absolute',
    width: 130,
  },
});
