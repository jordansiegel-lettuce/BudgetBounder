import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, HeroPlate, Pill, ProgressBar, ScreenScaffold, Section } from '@/src/components/ScreenScaffold';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ScreenScaffold eyebrow="Player HUD" title="Base Camp">
      <HeroPlate title="Budget Bounder" subtitle="Spend smart. Clear quests. Unlock the next stage.">
        <View style={styles.heroTopRow}>
          <View>
            <ThemedText style={styles.label}>Coins left this week</ThemedText>
            <ThemedText style={[styles.heroAmount, { color: palette.surface }]}>$426.80</ThemedText>
          </View>
          <Pill label="Lv 7" tone="success" />
        </View>
        <ProgressBar progress={0.68} color={palette.accent} />
        <View style={styles.heroBottomRow}>
          <ThemedText style={styles.heroMeta}>$213.20 spent</ThemedText>
          <ThemedText style={styles.heroMeta}>680 / 1,000 XP</ThemedText>
        </View>
      </HeroPlate>

      <View style={styles.statGrid}>
        <StatCard label="Vault" value="$1,240" detail="+$90 this month" tone={palette.success} />
        <StatCard label="Combo" value="12 days" detail="3 quests ready" tone={palette.accent} />
      </View>

      <Section title="Next Quest">
        <Card>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <ThemedText type="defaultSemiBold">Defeat the dining spike</ThemedText>
              <ThemedText style={[styles.body, { color: palette.mutedText }]}>
                Food spend is near the danger zone. Log one decision today to keep the combo alive.
              </ThemedText>
            </View>
            <Pill label="+35 XP" />
          </View>
        </Card>
      </Section>

      <Section title="Battle Log">
        {[
          ['Coffee run', 'Food and drinks loot spent', '-$5.40'],
          ['Emergency fund', 'Vault deposit', '+$50.00'],
          ['Weekly quest', 'Transport budget cleared', '+80 XP'],
        ].map(([title, detail, amount]) => (
          <Card key={title} style={styles.compactCard}>
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <ThemedText type="defaultSemiBold">{title}</ThemedText>
                <ThemedText style={[styles.caption, { color: palette.mutedText }]}>{detail}</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold">{amount}</ThemedText>
            </View>
          </Card>
        ))}
      </Section>
    </ScreenScaffold>
  );
}

function StatCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <Card style={styles.statCard}>
      <ThemedText style={[styles.label, { color: palette.mutedText }]}>{label}</ThemedText>
      <ThemedText type="subtitle" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.caption, { color: tone }]}>{detail}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
    textShadowColor: '#21242e',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    fontSize: 21,
  },
  label: {
    color: '#21242e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  heroMeta: {
    color: '#21242e',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  compactCard: {
    paddingVertical: 14,
  },
  flex: {
    flex: 1,
  },
});
