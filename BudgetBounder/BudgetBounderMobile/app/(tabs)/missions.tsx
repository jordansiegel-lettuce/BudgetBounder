import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, Pill, ScreenScaffold, Section } from '@/src/components/ScreenScaffold';

const missions = [
  {
    title: 'Log every purchase today',
    description: 'Keep the transaction trail complete before midnight.',
    type: 'Daily',
    reward: '+25 XP',
  },
  {
    title: 'Stay below transport budget',
    description: 'Finish the week under the current transport cap.',
    type: 'Weekly',
    reward: '+80 XP',
  },
  {
    title: 'Cook two meals at home',
    description: 'AI mission based on the recent dining spike.',
    type: 'Personal',
    reward: '+50 XP',
  },
];

export default function MissionsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ScreenScaffold eyebrow="Quest Board" title="Missions" action={<Pill label="Reroll" tone="warning" />}>
      <Card style={{ backgroundColor: palette.chromeSoft }}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <ThemedText type="defaultSemiBold">Today&apos;s combo</ThemedText>
            <ThemedText style={[styles.caption, { color: palette.mutedText }]}>
              Complete one real money move to protect your 12 day chain.
            </ThemedText>
          </View>
          <ThemedText style={styles.streak}>12</ThemedText>
        </View>
      </Card>

      <Section title="Available Quests">
        {missions.map((mission) => (
          <Card key={mission.title}>
            <View style={styles.rowBetween}>
              <Pill label={mission.type} tone={mission.type === 'Personal' ? 'warning' : 'neutral'} />
              <ThemedText type="defaultSemiBold">{mission.reward}</ThemedText>
            </View>
            <View>
              <ThemedText type="defaultSemiBold">{mission.title}</ThemedText>
              <ThemedText style={[styles.body, { color: palette.mutedText }]}>
                {mission.description}
              </ThemedText>
            </View>
          </Card>
        ))}
      </Section>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
  body: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  streak: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  flex: {
    flex: 1,
  },
});
