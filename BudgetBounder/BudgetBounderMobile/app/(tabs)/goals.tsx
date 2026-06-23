import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, Pill, ProgressBar, ScreenScaffold, Section } from '@/src/components/ScreenScaffold';

const goals = [
  { name: 'Emergency Fund', saved: 1240, target: 2000, reward: '+100 XP' },
  { name: 'Graduation Demo Kit', saved: 310, target: 650, reward: '+60 XP' },
  { name: 'Weekend Buffer', saved: 180, target: 250, reward: '+40 XP' },
];

export default function GoalsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ScreenScaffold eyebrow="Vault Room" title="Save Quest" action={<Pill label="Go" />}>
      <Card style={{ backgroundColor: palette.ice }}>
        <ThemedText style={[styles.caption, { color: palette.mutedText }]}>Gold stored</ThemedText>
        <ThemedText style={styles.total}>$1,730</ThemedText>
        <ThemedText style={[styles.caption, { color: palette.mutedText }]}>
          XP reward triggers once when a chest reaches 100%.
        </ThemedText>
      </Card>

      <Section title="Open Chests">
        {goals.map((goal) => {
          const progress = goal.saved / goal.target;

          return (
            <Card key={goal.name}>
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <ThemedText type="defaultSemiBold">{goal.name}</ThemedText>
                  <ThemedText style={[styles.caption, { color: palette.mutedText }]}>
                    ${goal.saved} of ${goal.target}
                  </ThemedText>
                </View>
                <Pill label={goal.reward} />
              </View>
              <ProgressBar progress={progress} />
              <ThemedText style={[styles.caption, { color: palette.mutedText }]}>
                {Math.round(progress * 100)}% charged
              </ThemedText>
            </Card>
          );
        })}
      </Section>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  total: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  flex: {
    flex: 1,
  },
});
