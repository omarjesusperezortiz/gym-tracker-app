import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { catalog, type PlanKey } from '@gym-tracker/core';

import { type InProgressSession, listInProgress, loadSelectedPlan, saveSelectedPlan } from '@/src/lib/draft';
import { colors, dayColors, radius } from '@/src/theme';

const PLAN_KEYS = Object.keys(catalog.plans) as PlanKey[];

function dayColor(planKey: PlanKey, sessKey: string) {
  const keys = Object.keys(catalog.plans[planKey].sessions);
  const i = keys.indexOf(sessKey);
  return dayColors[(i >= 0 ? i : 0) % dayColors.length];
}

export default function HomeScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanKey>('gym');
  const [inProgress, setInProgress] = useState<InProgressSession[]>([]);

  useEffect(() => {
    loadSelectedPlan().then((saved) => {
      if (saved && PLAN_KEYS.includes(saved as PlanKey)) setPlan(saved as PlanKey);
    });
  }, []);

  const refreshInProgress = useCallback(() => {
    listInProgress((pk, sk) => {
      const p = catalog.plans[pk as PlanKey];
      const s = p?.sessions[sk];
      return s ? s.slots.length : null;
    }).then(setInProgress);
  }, []);

  useFocusEffect(refreshInProgress);

  function selectPlan(pk: PlanKey) {
    setPlan(pk);
    saveSelectedPlan(pk);
  }

  function openSession(pk: PlanKey, sk: string) {
    router.push({ pathname: '/train', params: { plan: pk, sess: sk } });
  }

  const planData = catalog.plans[plan];
  const sessionKeys = Object.keys(planData.sessions);
  const groups: [string, string][] = [
    ['broad', '⚡ Quick picks'],
    ['focused', '🎯 Focused'],
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Let&apos;s train 💪</Text>
          <Text style={styles.subtitle}>Pick your mode, then today&apos;s focus.</Text>
        </View>
        <Pressable style={styles.gearBtn} onPress={() => router.push('/settings')}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      {inProgress.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>▶ Continue where you left off</Text>
          {inProgress.map((ip) => {
            const s = catalog.plans[ip.plan as PlanKey]?.sessions[ip.sess];
            if (!s) return null;
            const col = dayColor(ip.plan as PlanKey, ip.sess);
            return (
              <Pressable
                key={`${ip.plan}|${ip.sess}`}
                style={styles.resumeRow}
                onPress={() => openSession(ip.plan as PlanKey, ip.sess)}
              >
                <View style={[styles.barAccent, { backgroundColor: col }]} />
                <Text style={styles.resumeEmoji}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resumeName}>{s.name}</Text>
                  <Text style={styles.resumeMeta}>
                    {ip.done} of {ip.total} done · tap to resume
                  </Text>
                </View>
                <Text style={{ color: colors.acc, fontSize: 18 }}>▶</Text>
              </Pressable>
            );
          })}
        </>
      )}

      <Text style={styles.sectionLabel}>Mode</Text>
      <View style={styles.planGrid}>
        {PLAN_KEYS.map((pk) => {
          const pl = catalog.plans[pk];
          const active = pk === plan;
          return (
            <Pressable
              key={pk}
              style={[styles.planCard, active && styles.planCardActive]}
              onPress={() => selectPlan(pk)}
            >
              <Text style={styles.planEmoji}>{pl.icon}</Text>
              <Text style={[styles.planLabel, active && styles.planLabelActive]}>{pl.label}</Text>
              <Text style={styles.planSub}>{Object.keys(pl.sessions).length} days</Text>
            </Pressable>
          );
        })}
      </View>

      {groups.map(([group, label]) => {
        const keys = sessionKeys.filter((k) => (planData.sessions[k].group || 'focused') === group);
        if (!keys.length) return null;
        return (
          <View key={group}>
            <Text style={styles.sectionLabel}>{label}</Text>
            <View style={styles.dayList}>
              {keys.map((k) => {
                const s = planData.sessions[k];
                const col = dayColor(plan, k);
                return (
                  <Pressable key={k} style={styles.dayRow} onPress={() => openSession(plan, k)}>
                    <View style={[styles.barAccent, { backgroundColor: col }]} />
                    <Text style={styles.dayEmoji}>{s.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dayName}>{s.name}</Text>
                      <Text style={styles.dayMuscles}>{s.muscles}</Text>
                    </View>
                    <Text style={styles.dayCount}>{s.slots.length} ex</Text>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40, gap: 4 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.mut, marginTop: 2 },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surf,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.mut,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 18,
    marginBottom: 8,
  },
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surf,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  barAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  resumeEmoji: { fontSize: 24 },
  resumeName: { color: colors.ink, fontWeight: '600', fontSize: 15 },
  resumeMeta: { color: colors.mut, fontSize: 12, marginTop: 2 },
  planGrid: { flexDirection: 'row', gap: 10 },
  planCard: {
    flex: 1,
    backgroundColor: colors.surf,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    alignItems: 'center',
    gap: 2,
  },
  planCardActive: {
    backgroundColor: colors.acc,
    borderColor: colors.acc,
  },
  planEmoji: { fontSize: 22 },
  planLabel: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  planLabelActive: { color: colors.accInk },
  planSub: { color: colors.mut, fontSize: 11.5 },
  dayList: { gap: 8 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surf,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  dayEmoji: { fontSize: 20 },
  dayName: { color: colors.ink, fontWeight: '600', fontSize: 14.5 },
  dayMuscles: { color: colors.mut, fontSize: 12, marginTop: 2 },
  dayCount: { color: colors.mut, fontSize: 12 },
  chevron: { color: colors.mut, fontSize: 18 },
});
