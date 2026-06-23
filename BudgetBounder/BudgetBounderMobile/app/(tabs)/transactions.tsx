import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, Pill, ProgressBar, ScreenScaffold, Section } from '@/src/components/ScreenScaffold';

const categories = [
  { name: 'Food', spent: 214, limit: 300 },
  { name: 'Transport', spent: 82, limit: 120 },
  { name: 'Entertainment', spent: 96, limit: 100 },
];

const transactions = [
  ['Grocery top-up', 'Food', '$42.10'],
  ['Bus card', 'Transport', '$18.00'],
  ['Movie night', 'Entertainment', '$24.00'],
  ['Pharmacy', 'Health', '$12.60'],
];

export default function TransactionsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ScreenScaffold eyebrow="Coin Bank" title="Spend Map" action={<Pill label="Go" />}>
      <Section title="Threat Meters">
        {categories.map((category) => {
          const progress = category.spent / category.limit;
          const isTight = progress > 0.85;

          return (
            <Card key={category.name}>
              <View style={styles.rowBetween}>
                <View>
                  <ThemedText type="defaultSemiBold">{category.name} Zone</ThemedText>
                  <ThemedText style={[styles.caption, { color: palette.mutedText }]}>
                    ${category.spent} of ${category.limit}
                  </ThemedText>
                </View>
                <Pill label={isTight ? 'Boss' : 'Clear'} tone={isTight ? 'warning' : 'success'} />
              </View>
              <ProgressBar progress={progress} color={isTight ? palette.warning : palette.success} />
            </Card>
          );
        })}
      </Section>

      <Section title="Loot Drops">
        {transactions.map(([name, category, amount]) => (
          <Card key={name} style={styles.listCard}>
            <View style={styles.rowBetween}>
              <View style={[styles.categoryChip, { backgroundColor: palette.carbon }]}>
                <ThemedText style={[styles.categoryText, { color: palette.chromeSoft }]}>
                  {category.slice(0, 1)}
                </ThemedText>
              </View>
              <View style={styles.flex}>
                <ThemedText type="defaultSemiBold">{name}</ThemedText>
                <ThemedText style={[styles.caption, { color: palette.mutedText }]}>{category}</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold">{amount}</ThemedText>
              <View style={[styles.arrowChip, { backgroundColor: palette.accent }]}>
                <ThemedText style={styles.arrowText}>{'>'}</ThemedText>
              </View>
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
    marginTop: 2,
  },
  listCard: {
    paddingVertical: 14,
  },
  flex: {
    flex: 1,
  },
  categoryChip: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  arrowChip: {
    alignItems: 'center',
    borderRadius: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  arrowText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 22,
  },
});
