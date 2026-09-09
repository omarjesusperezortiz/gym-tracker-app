import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  catalog,
  fetchHistory,
  finishWorkout,
  fmtLast,
  isTimeScheme,
  KIND_LABEL,
  lastFor,
  parseTarget,
  type HistorySlotEntry,
  type Kind,
  type LoggedSlot,
  type PlanKey,
} from '@gym-tracker/core';

import {
  clearDraft,
  loadDraft,
  loadKindPrefs,
  saveDraft as persistDraft,
  saveKindPref,
  type Draft,
  type DraftSlot,
} from '@/src/lib/draft';
import { colors, radius } from '@/src/theme';

export default function TrainScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ plan: string; sess: string }>();
  const planKey = params.plan as PlanKey;
  const sessKey = params.sess as string;

  const planData = catalog.plans[planKey];
  const session = planData?.sessions[sessKey];

  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<Draft>({});
  const [history, setHistory] = useState<HistorySlotEntry[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [zoomUri, setZoomUri] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const [storedDraft, kindPrefs, historyResult] = await Promise.all([
        loadDraft(planKey, sessKey),
        loadKindPrefs(),
        fetchHistory().catch((e) => {
          if (!cancelled) setHistoryError(e instanceof Error ? e.message : 'Could not load history');
          return [] as HistorySlotEntry[];
        }),
      ]);
      if (cancelled) return;
      const next: Draft = { ...storedDraft };
      for (const [slot, scheme] of session.slots) {
        if (next[slot]) continue;
        const kinds = Object.keys(planData.variations[slot] || {}) as Kind[];
        const preferred = kindPrefs[`${planKey}|${slot}`];
        const kind: Kind = preferred || kinds[0] || 'bw';
        next[slot] = {
          kind,
          done: false,
          force: false,
          sets: Array.from({ length: parseTarget(scheme) }, () => ({ w: '', r: '' })),
        };
      }
      setDraft(next);
      setHistory(historyResult);
      loadedRef.current = true;
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey, sessKey]);

  useEffect(() => {
    if (!loadedRef.current) return;
    persistDraft(planKey, sessKey, draft);
  }, [draft, planKey, sessKey]);

  if (!planData || !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>That session isn&apos;t available.</Text>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.acc} size="large" />
      </View>
    );
  }

  const doneCount = session.slots.filter(([slot]) => draft[slot]?.done).length;
  const total = session.slots.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  function updateSlot(slot: string, patch: Partial<DraftSlot>) {
    setDraft((prev) => ({ ...prev, [slot]: { ...prev[slot], ...patch } }));
  }

  function updateSet(slot: string, index: number, field: 'w' | 'r', value: string) {
    setDraft((prev) => {
      const st = prev[slot];
      const sets = st.sets.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, [slot]: { ...st, sets } };
    });
  }

  function addSet(slot: string) {
    setDraft((prev) => {
      const st = prev[slot];
      return { ...prev, [slot]: { ...st, sets: [...st.sets, { w: '', r: '' }] } };
    });
  }

  function switchKind(slot: string, kind: Kind) {
    updateSlot(slot, { kind });
    saveKindPref(planKey, slot, kind);
  }

  function saveProgressNow() {
    persistDraft(planKey, sessKey, draft);
    Alert.alert('Saved', 'Progress saved 💾');
  }

  async function finish() {
    const slots: LoggedSlot[] = [];
    for (const [slot] of session!.slots) {
      const st = draft[slot];
      if (!st) continue;
      const sets = st.sets.filter((x) => x.w !== '' || x.r !== '');
      if (sets.length || st.done) {
        slots.push({ slot, kind: st.kind, done: st.done, force: st.force, sets });
      }
    }
    if (!slots.length) {
      Alert.alert('Log something first 💪');
      return;
    }
    setFinishing(true);
    try {
      await finishWorkout({
        date: new Date().toISOString(),
        plan: planKey,
        sess: sessKey,
        name: session!.name,
        slots,
      });
      await clearDraft(planKey, sessKey);
      Alert.alert(`${session!.name} finished! 🎉`);
      router.replace('/(tabs)/home');
    } catch (e) {
      Alert.alert('Could not save workout', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setFinishing(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {session.emoji} {session.name}
          </Text>
          <Text style={styles.headerSub}>
            {planData.icon} {planData.label} · {session.muscles}
          </Text>
        </View>
        <Text style={styles.headerProgress}>
          {doneCount}/{total}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {historyError && <Text style={styles.historyError}>Couldn&apos;t load history: {historyError}</Text>}
        {session.slots.map(([slot, scheme, force], i) => {
          const st = draft[slot];
          if (!st) return null;
          const kinds = Object.keys(planData.variations[slot] || {}) as Kind[];
          const variationsForSlot = planData.variations[slot] || {};
          const variation = variationsForSlot[st.kind] || Object.values(variationsForSlot)[0];
          const cue = variation ? planData.cues[variation.name] : undefined;
          const timeBased = isTimeScheme(scheme);
          const weighted = st.kind !== 'bw';
          const lastSets = lastFor(history, slot, st.kind);

          return (
            <View key={slot} style={[styles.card, st.done && styles.cardDone]}>
              <View style={styles.cardHead}>
                <View style={styles.numBadge}>
                  <Text style={styles.numBadgeText}>{st.done ? '✓' : i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exName}>{slot}</Text>
                  <View style={styles.schemeRow}>
                    <View style={styles.schemePill}>
                      <Text style={styles.schemePillText}>{st.force && force ? force : scheme}</Text>
                    </View>
                    {!!force && (
                      <Pressable
                        style={[styles.forceBtn, st.force && styles.forceBtnOn]}
                        onPress={() => updateSlot(slot, { force: !st.force })}
                      >
                        <Text style={[styles.forceBtnText, st.force && styles.forceBtnTextOn]}>💪 Force</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
                <Pressable
                  style={[styles.checkBtn, st.done && styles.checkBtnOn]}
                  onPress={() => updateSlot(slot, { done: !st.done })}
                >
                  <Text style={st.done ? styles.checkBtnTextOn : styles.checkBtnText}>✓</Text>
                </Pressable>
              </View>

              {kinds.length > 1 && (
                <View style={styles.seg}>
                  {kinds.map((k) => (
                    <Pressable
                      key={k}
                      style={[styles.segItem, k === st.kind && styles.segItemActive]}
                      onPress={() => switchKind(slot, k)}
                    >
                      <Text style={[styles.segItemText, k === st.kind && styles.segItemTextActive]}>
                        {KIND_LABEL[k]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {variation && (
                <>
                  <Text style={styles.varName}>{variation.name}</Text>
                  {!!cue && <Text style={styles.cue}>{cue}</Text>}
                  <View style={styles.imgRow}>
                    <Pressable style={styles.imgCell} onPress={() => setZoomUri(variation.img)}>
                      <Text style={styles.imgTag}>Start</Text>
                      <Image source={{ uri: variation.img }} style={styles.img} resizeMode="cover" />
                    </Pressable>
                    <Pressable style={styles.imgCell} onPress={() => setZoomUri(variation.img2)}>
                      <Text style={styles.imgTag}>Finish</Text>
                      <Image source={{ uri: variation.img2 }} style={styles.img} resizeMode="cover" />
                    </Pressable>
                  </View>
                </>
              )}

              {!!force && st.force && (
                <Text style={styles.forceNote}>
                  <Text style={{ fontWeight: '700' }}>💪 Strength:</Text> {force} — heavier, fewer reps, longer rest.
                </Text>
              )}

              <View style={styles.sets}>
                {st.sets.map((set, j) => (
                  <View key={j} style={styles.setRow}>
                    <Text style={styles.setLabel}>SET {j + 1}</Text>
                    {weighted && (
                      <>
                        <TextInput
                          style={styles.setInput}
                          placeholder="kg"
                          placeholderTextColor={colors.mut}
                          keyboardType="decimal-pad"
                          value={set.w}
                          onChangeText={(v) => updateSet(slot, j, 'w', v)}
                        />
                        <Text style={styles.xSep}>×</Text>
                      </>
                    )}
                    <TextInput
                      style={styles.setInput}
                      placeholder={timeBased ? 'sec' : 'reps'}
                      placeholderTextColor={colors.mut}
                      keyboardType="number-pad"
                      value={set.r}
                      onChangeText={(v) => updateSet(slot, j, 'r', v)}
                    />
                    <Text style={styles.lastHint} numberOfLines={1}>
                      {fmtLast(lastSets?.[j], weighted, timeBased)}
                    </Text>
                  </View>
                ))}
              </View>
              <Pressable style={styles.addSetBtn} onPress={() => addSet(slot)}>
                <Text style={styles.addSetText}>+ Add set</Text>
              </Pressable>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.saveBtn} onPress={saveProgressNow}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
        <Pressable style={styles.finishBtn} onPress={finish} disabled={finishing}>
          {finishing ? (
            <ActivityIndicator color={colors.accInk} />
          ) : (
            <Text style={styles.finishBtnText}>Finish</Text>
          )}
        </Pressable>
      </View>

      <Modal visible={!!zoomUri} transparent animationType="fade" onRequestClose={() => setZoomUri(null)}>
        <Pressable style={styles.lightbox} onPress={() => setZoomUri(null)}>
          {zoomUri && <Image source={{ uri: zoomUri }} style={styles.lightboxImg} resizeMode="contain" />}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: colors.ink2, fontSize: 15 },
  backLink: { padding: 10 },
  backLinkText: { color: colors.acc, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: colors.ink, fontSize: 26, marginTop: -4 },
  headerTitle: { color: colors.ink, fontWeight: '700', fontSize: 15.5 },
  headerSub: { color: colors.mut, fontSize: 11.5, marginTop: 2 },
  headerProgress: { color: colors.acc, fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },
  historyError: { color: colors.warn, fontSize: 12, marginBottom: 4 },
  card: {
    backgroundColor: colors.surf,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  cardDone: { borderColor: colors.acc },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  numBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surf3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: { color: colors.ink2, fontWeight: '700', fontSize: 12 },
  exName: { color: colors.ink, fontWeight: '700', fontSize: 15 },
  schemeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  schemePill: {
    backgroundColor: colors.surf2,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  schemePillText: { color: colors.ink2, fontSize: 11.5, fontWeight: '600' },
  forceBtn: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.line2,
  },
  forceBtnOn: { backgroundColor: colors.warn, borderColor: colors.warn },
  forceBtnText: { color: colors.mut, fontSize: 11.5, fontWeight: '600' },
  forceBtnTextOn: { color: colors.accInk },
  checkBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnOn: { backgroundColor: colors.acc, borderColor: colors.acc },
  checkBtnText: { color: colors.mut, fontWeight: '700' },
  checkBtnTextOn: { color: colors.accInk, fontWeight: '700' },
  seg: {
    flexDirection: 'row',
    backgroundColor: colors.surf2,
    borderRadius: radius.sm,
    padding: 3,
  },
  segItem: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: radius.sm - 2 },
  segItemActive: { backgroundColor: colors.acc },
  segItemText: { color: colors.mut, fontSize: 12, fontWeight: '600' },
  segItemTextActive: { color: colors.accInk },
  varName: { color: colors.ink, fontSize: 13.5, fontWeight: '600' },
  cue: { color: colors.mut, fontSize: 12, marginTop: -6, lineHeight: 17 },
  imgRow: { flexDirection: 'row', gap: 8 },
  imgCell: { flex: 1 },
  imgTag: { color: colors.mut, fontSize: 10.5, marginBottom: 4 },
  img: { width: '100%', aspectRatio: 1, borderRadius: radius.sm, backgroundColor: colors.surf2 },
  forceNote: { color: colors.ink2, fontSize: 12, backgroundColor: colors.surf2, padding: 8, borderRadius: radius.sm },
  sets: { gap: 8 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setLabel: { color: colors.mut, fontSize: 11, fontWeight: '700', width: 46 },
  setInput: {
    flex: 1,
    backgroundColor: colors.surf2,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.ink,
    fontSize: 14,
  },
  xSep: { color: colors.mut, fontSize: 13 },
  lastHint: { color: colors.mut, fontSize: 11, width: 64, textAlign: 'right' },
  addSetBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  addSetText: { color: colors.acc, fontSize: 13, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    paddingBottom: 28,
    backgroundColor: colors.panel,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.surf,
    borderWidth: 1,
    borderColor: colors.line2,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: colors.ink2, fontWeight: '700', fontSize: 14.5 },
  finishBtn: {
    flex: 2,
    backgroundColor: colors.acc,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  finishBtnText: { color: colors.accInk, fontWeight: '700', fontSize: 14.5 },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImg: { width: '100%', height: '80%' },
});
