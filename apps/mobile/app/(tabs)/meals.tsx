import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { catalog } from '@gym-tracker/core';

import { colors, radius } from '@/src/theme';

interface MealsData {
  targets: { protein: string; calories: string; water: string; note: string };
  principles: string[];
  meals: { t: string; p: string; ideas: string[] }[];
  protein_foods: string[];
}

const M = catalog.meals as unknown as MealsData;

export default function MealsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Meals</Text>

      <View style={styles.targetCard}>
        <View style={styles.targetRow}>
          <View style={styles.targetItem}>
            <Text style={styles.targetValue}>{M.targets.protein.split(' ')[0]}</Text>
            <Text style={styles.targetLabel}>protein/day</Text>
          </View>
          <View style={styles.targetItem}>
            <Text style={styles.targetValue}>{M.targets.calories}</Text>
            <Text style={styles.targetLabel}>calories</Text>
          </View>
          <View style={styles.targetItem}>
            <Text style={styles.targetValue}>{M.targets.water}</Text>
            <Text style={styles.targetLabel}>water</Text>
          </View>
        </View>
        <Text style={styles.targetNote}>{M.targets.note}</Text>
      </View>

      <Text style={styles.sectionLabel}>Principles</Text>
      {M.principles.map((p, i) => (
        <Text key={i} style={styles.idea}>
          {p}
        </Text>
      ))}

      <Text style={styles.sectionLabel}>Daily meals</Text>
      {M.meals.map((mm, i) => (
        <View key={i} style={styles.mealCard}>
          <View style={styles.mealHeadRow}>
            <Text style={styles.mealTitle}>{mm.t}</Text>
            <Text style={styles.mealProtein}>{mm.p}</Text>
          </View>
          {mm.ideas.map((idea, j) => (
            <Text key={j} style={styles.idea}>
              {idea}
            </Text>
          ))}
        </View>
      ))}

      <Text style={styles.sectionLabel}>Go-to protein foods</Text>
      <View style={styles.chipRow}>
        {M.protein_foods.map((f, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{f}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  targetCard: {
    backgroundColor: colors.surf,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 10,
  },
  targetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  targetItem: { alignItems: 'center', flex: 1 },
  targetValue: { color: colors.acc, fontWeight: '700', fontSize: 15 },
  targetLabel: { color: colors.mut, fontSize: 11, marginTop: 2 },
  targetNote: { color: colors.ink2, fontSize: 12.5, lineHeight: 18 },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.mut,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 18,
    marginBottom: 8,
  },
  idea: { color: colors.ink2, fontSize: 13, lineHeight: 19, marginBottom: 6 },
  mealCard: {
    backgroundColor: colors.surf,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 10,
  },
  mealHeadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mealTitle: { color: colors.ink, fontWeight: '700', fontSize: 14.5 },
  mealProtein: { color: colors.acc, fontSize: 12.5, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.surf2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { color: colors.ink2, fontSize: 12.5 },
});
