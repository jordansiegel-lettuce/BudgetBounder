import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, Pill, ProgressBar, ScreenScaffold, Section } from '@/src/components/ScreenScaffold';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ScreenScaffold eyebrow="Player Card" title="Hero Stats">
      <Card style={{ backgroundColor: palette.ice }}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: palette.surface, borderColor: palette.bevelDark }]}>
            <ThemedText style={styles.avatarText}>J</ThemedText>
          </View>
          <View style={styles.flex}>
            <ThemedText type="subtitle">Jordi</ThemedText>
            <ThemedText style={[styles.caption, { color: palette.mutedText }]}>
              Level 7 coin strategist
            </ThemedText>
          </View>
          <Pill label="680 XP" />
        </View>
        <ProgressBar progress={0.68} color={palette.accent} />
      </Card>

      <Section title="Level Unlocks">
        {[
          ['Arcade gates', 'Unity levels unlock with your BudgetBounder level.'],
          ['Badge shelf', 'Pixel badges for combos, vault milestones, and smart spending.'],
          ['Live XP sync', 'XP and level refresh from the user endpoint after rewards.'],
        ].map(([title, description]) => (
          <Card key={title} style={styles.listCard}>
            <ThemedText type="defaultSemiBold">{title}</ThemedText>
            <ThemedText style={[styles.body, { color: palette.mutedText }]}>{description}</ThemedText>
          </Card>
        ))}
      </Section>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 2,
    borderWidth: 2,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  body: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  listCard: {
    paddingVertical: 14,
  },
  flex: {
    flex: 1,
  },
});
