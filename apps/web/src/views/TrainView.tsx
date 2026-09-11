import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  catalog,
  effectiveSession,
  fmtLast,
  isTimeScheme,
  lastFor,
  lastKindFor,
  kindsLoggedFor,
  parseTarget,
} from '@gym-tracker/core';
import type { AddedSlot, Kind, Variation } from '@gym-tracker/core';
import { keyOf, useAppState, type LiveSet, type LiveSlotState } from '../state/AppState';
import { useWorkouts } from '../lib/useWorkouts';
import { useFinishWorkout, useUpdateWorkout } from '../lib/useWorkoutMutations';
import { toHistorySlotEntries } from '../lib/workouts';
import { effectiveValue } from '../lib/ghost';
import { bestWeight, computeStreak, progressionTarget, topEnteredWeight } from '../lib/progression';
import { usePrefs } from '../lib/useProfileData';
import { useCustomizations, useResetCustomization, useSaveCustomization } from '../lib/useCustomizations';
import { addSlot, hasCustomization, hideSlot, moveSlot, removeAdded, withOneOffs } from '../lib/overlay';
import { useToast } from '../components/Toast';
import { Dock } from '../components/Dock';
import { Lightbox } from '../components/Lightbox';
import { RestTimer } from '../components/RestTimer';
import { PrBurstStack, type PrBurstData } from '../components/PrBurst';
import { CompletionCelebration, type CompletionSummary } from '../components/CompletionCelebration';
import { ExerciseCard } from './ExerciseCard';
import { AddExerciseSheet, type AddScope } from './AddExerciseSheet';
import { IconBack, IconClose, IconEdit, IconPlus } from '../lib/icons';
import '../styles/train-extras.css';

const EMPTY_ONE_OFFS: AddedSlot[] = [];
const DEFAULT_REST_SECONDS = 90;

function firstKind(variations: Partial<Record<Kind, Variation>> | undefined): Kind {
  const keys = variations ? (Object.keys(variations) as Kind[]) : [];
  return keys[0] || 'bw';
}

export function TrainView() {
  const { state, dispatch } = useAppState();
  const { history, loading } = useWorkouts();
  const { toast } = useToast();
  const { data: prefs } = usePrefs();
  const [zoom, setZoom] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restNonce, setRestNonce] = useState(0);
  // "Auto-fill suggested weight" preference — persisted to localStorage. When on,
  // empty sets show the SUGGESTED next weight as a gray ghost (still display-only,
  // never written until the user types) instead of last time's numbers.
  const [autofill, setAutofill] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autofillSuggested') === '1';
    } catch {
      return false;
    }
  });
  const toggleAutofill = () =>
    setAutofill((v) => {
      const next = !v;
      try {
        localStorage.setItem('autofillSuggested', next ? '1' : '0');
      } catch {
        /* ignore storage failures (private mode etc.) */
      }
      return next;
    });
  const startRest = () => {
    setRestSeconds(restPref);
    setRestNonce((n) => n + 1);
  };
  const [bursts, setBursts] = useState<PrBurstData[]>([]);
  const [celebration, setCelebration] = useState<CompletionSummary | null>(null);
  // Exercises that already fired a PR burst this session, so it's one per lift.
  const prShownRef = useRef<Set<string>>(new Set());
  const burstIdRef = useRef(0);
  const finishMutation = useFinishWorkout();
  const updateMutation = useUpdateWorkout();
  const { overlayFor } = useCustomizations();
  const saveCustomization = useSaveCustomization();
  const resetCustomization = useResetCustomization();

  const restPref = prefs?.restSeconds ?? DEFAULT_REST_SECONDS;

  const historyEntries = useMemo(() => toHistorySlotEntries(history), [history]);
  const P = catalog.plans[state.plan];
  const keys = Object.keys(P.sessions);
  const cur = state.cur && keys.includes(state.cur) ? state.cur : keys[0];

  // What the user actually trains = catalog session + their saved overlay +
  // anything added just for today (which is never written to the overlay).
  const sessionKey = `${state.plan}|${cur}`;
  const storedOverlay = overlayFor(state.plan, cur);
  const oneOffs = useMemo(() => state.oneOff[sessionKey] ?? EMPTY_ONE_OFFS, [state.oneOff, sessionKey]);
  const base = P.sessions[cur];
  const session = useMemo(
    () => effectiveSession(base, withOneOffs(storedOverlay, oneOffs)),
    [base, storedOverlay, oneOffs]
  );
  const slotNames = session.slots.map((sl) => sl[0]);
  const oneOffNames = oneOffs.map((a) => a.slot);
  const addedNames = new Set([...storedOverlay.added.map((a) => a.slot), ...oneOffNames]);
  const canReset = hasCustomization(storedOverlay);

  // Populate any not-yet-seen slot with its default equipment + a fresh set of
  // inputs pre-filled with the "last time" hint, exactly once per slot.
  useEffect(() => {
    if (loading) return;
    session.slots.forEach((sl) => {
      const [slot, scheme] = sl;
      const key = keyOf(state.plan, cur, slot);
      if (state.live[key]) return;
      // Which equipment tab to open on: explicit user choice for this slot wins;
      // otherwise the kind from the most recent logged workout ("remember where I
      // was"); otherwise the first available variation.
      const validKinds = P.variations[slot] || {};
      const remembered = lastKindFor(historyEntries, slot);
      // Every exercise comes from the catalog (which has variations); the 'bar'
      // fallback is just defensive in case a slot lacks a variations entry.
      const fallback: Kind = Object.keys(validKinds).length ? firstKind(validKinds) : 'bar';
      const kind =
        state.pref[`${state.plan}|${slot}`] ||
        (remembered && validKinds[remembered] ? remembered : fallback);
      const weighted = kind !== 'bw';
      const timeBased = isTimeScheme(scheme);
      const lp = lastFor(historyEntries, slot, kind);
      const n = parseTarget(scheme);
      const sets: LiveSet[] = Array.from({ length: n }, (_, j) => ({
        w: '',
        r: '',
        last: fmtLast(lp?.[j], weighted, timeBased),
      }));
      dispatch({ type: 'ENSURE_SLOT', key, slot: { kind, done: false, force: false, sets } });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, state.plan, cur, historyEntries, slotNames.join('|')]);

  const done = session.slots.filter((sl) => state.live[keyOf(state.plan, cur, sl[0])]?.done).length;
  const total = session.slots.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const isEditingCurrent = state.editingId != null && state.editingKey === `${state.plan}|${cur}`;

  function goHome() {
    dispatch({ type: 'GO_HOME' });
  }

  // Fire a one-per-exercise-per-session PR burst when the heaviest weight the
  // user just entered for a slot beats their previous all-time best.
  function checkPr(slot: string, sets: LiveSet[]) {
    if (prShownRef.current.has(slot)) return;
    const top = topEnteredWeight(sets);
    if (top <= 0) return;
    const prev = bestWeight(historyEntries, slot);
    if (prev > 0 && top > prev) {
      prShownRef.current.add(slot);
      const id = ++burstIdRef.current;
      setBursts((b) => [...b, { id, exercise: slot, weightKg: top }]);
    }
  }

  function dismissBurst(id: number) {
    setBursts((b) => b.filter((x) => x.id !== id));
  }

  // Mark done, then celebrate a PR and start the rest countdown (only when the
  // set was just completed, not when un-checking).
  function handleToggleDone(key: string, slot: string, st: LiveSlotState) {
    const wasDone = st.done;
    dispatch({ type: 'TOGGLE_DONE', key });
    if (!wasDone) {
      checkPr(slot, st.sets ?? []);
      // Note: no auto rest timer here — the user starts rest manually via the
      // Rest button (onRest). Checking an exercise done should not launch a timer.
    }
  }

  function handleSave() {
    toast('Progress saved 💾');
  }

  function cancelEdit() {
    dispatch({ type: 'CANCEL_EDIT', keys: session.slots.map((sl) => keyOf(state.plan, cur, sl[0])), sessionKey });
    toast('Edit discarded');
    goHome();
  }

  function handleFinish() {
    const slots: { slot: string; kind: Kind; done: boolean; force: boolean; sets: { w: string; r: string }[] }[] = [];
    session.slots.forEach((sl) => {
      const slot = sl[0];
      const key = keyOf(state.plan, cur, slot);
      const st = state.live[key];
      if (!st) return;
      const liveSets = st.sets ?? [];
      // A set counts as logged if it has a typed value OR inherits a ghost from a
      // filled set above. Persist the ghost's effective value (what the user saw).
      const sets = liveSets
        .map((_, j) => ({ w: effectiveValue(liveSets, j, 'w'), r: effectiveValue(liveSets, j, 'r') }))
        .filter((x) => x.w !== '' || x.r !== '');
      if (sets.length || st.done) slots.push({ slot, kind: st.kind, done: st.done, force: !!st.force, sets });
    });
    if (!slots.length) {
      toast('Log something first 💪');
      return;
    }

    // The cache is patched optimistically, so Home/Calendar already show this
    // workout — but the draft is only cleared once the save actually lands, so a
    // failed write leaves the logged sets (and any edit context) untouched.
    const clearDraft = () =>
      dispatch({ type: 'CLEAR_SLOTS', keys: session.slots.map((sl) => keyOf(state.plan, cur, sl[0])), sessionKey });
    const settle = (message: string) => {
      toast(message);
      clearDraft();
      goHome();
    };
    const onError = (err: Error) => toast(err.message || 'Could not save workout');

    if (isEditingCurrent && state.editingId) {
      updateMutation.mutate(
        { id: state.editingId, plan: state.plan, sess: cur, name: session.name, slots },
        { onSuccess: () => settle(`${session.name} updated ✏️`), onError }
      );
    } else {
      // Build the completion summary from what was just logged. Volume is the
      // sum of weight*reps; PRs are exercises whose top set beat the prior best;
      // the streak counts today (this workout) plus prior consecutive days.
      const exercises = slots.filter((s) => s.sets.length || s.done).length;
      const setCount = slots.reduce((n, s) => n + s.sets.length, 0);
      const volumeKg = slots.reduce(
        (v, s) =>
          v +
          s.sets.reduce((sv, set) => {
            const w = parseFloat(set.w);
            const r = parseFloat(set.r);
            return sv + (isNaN(w) || isNaN(r) || w <= 0 || r <= 0 ? 0 : w * r);
          }, 0),
        0
      );
      const prs = slots
        .filter((s) => {
          const top = topEnteredWeight(s.sets);
          const prev = bestWeight(historyEntries, s.slot);
          return top > 0 && prev > 0 && top > prev;
        })
        .map((s) => s.slot);
      const today = new Date().toISOString().slice(0, 10);
      const dates = [today, ...history.filter((w) => w.type === 'workout').map((w) => w.date)];
      const streak = computeStreak(dates);

      finishMutation.mutate(
        { date: new Date().toISOString(), plan: state.plan, sess: cur, name: session.name, slots },
        {
          onSuccess: () => {
            clearDraft();
            setCelebration({ sessionName: session.name, emoji: session.emoji, exercises, sets: setCount, volumeKg, prs, streak });
          },
          onError,
        }
      );
    }
  }

  // ── add / remove / reorder ────────────────────────────────────────────
  // Every permanent edit writes the whole overlay for this session; the pure
  // helpers in lib/overlay.ts compute it from what's stored (never including
  // today-only slots).
  function persist(overlay: ReturnType<typeof addSlot>, message: string) {
    saveCustomization.mutate(
      { plan: state.plan, sess: cur, overlay },
      { onSuccess: () => toast(message), onError: (err) => toast(err.message || 'Could not save the change') }
    );
  }

  function handleAdd(slot: AddedSlot, scope: AddScope) {
    setPicking(false);
    if (scope === 'today') {
      dispatch({ type: 'ADD_LIVE_SLOT', sessionKey, slot });
      toast(`${slot.slot} added for today`);
      return;
    }
    persist(addSlot(storedOverlay, slot), `${slot.slot} added to ${session.name}`);
  }

  function handleRemove(slot: string) {
    const key = keyOf(state.plan, cur, slot);
    if (oneOffNames.includes(slot)) {
      dispatch({ type: 'REMOVE_LIVE_SLOT', sessionKey, slot, key });
      toast(`${slot} removed`);
      return;
    }
    // An added exercise is dropped; a catalog one is hidden, since the base
    // session is shared and never edited in place.
    const isAdded = storedOverlay.added.some((a) => a.slot === slot);
    persist(isAdded ? removeAdded(storedOverlay, slot) : hideSlot(storedOverlay, slot), `${slot} removed`);
    dispatch({ type: 'CLEAR_SLOTS', keys: [key] });
  }

  function handleMove(slot: string, direction: -1 | 1) {
    const next = moveSlot(storedOverlay, slotNames, slot, direction, oneOffNames);
    if (next === storedOverlay) return;
    persist(next, 'Order saved');
  }

  function handleReset() {
    resetCustomization.mutate(
      { plan: state.plan, sess: cur },
      {
        onSuccess: () => {
          setEditing(false);
          toast(`${session.name} back to the default plan`);
        },
        onError: (err) => toast(err.message || 'Could not reset'),
      }
    );
  }

  return (
    <>
      <header>
        <div className="trainbar show">
          <div className="backbtn" onClick={goHome}>
            <IconBack />
          </div>
          <div className="tinfo">
            <div className="tt">
              <span className="tt-emoji">{session.emoji}</span>
              <span className="tt-name">{session.name}.</span>
            </div>
            <div className="tm">
              {isEditingCurrent && (
                <span className="editbadge" onClick={cancelEdit}>
                  <IconEdit /> editing · exit <IconClose />
                </span>
              )}{' '}
              {P.icon} {P.label} · {session.muscles}
            </div>
          </div>
          <button
            className={`tedit${editing ? ' on' : ''}`}
            onClick={() => setEditing((v) => !v)}
            aria-pressed={editing}
            aria-label={editing ? 'Done editing session' : 'Edit session'}
          >
            <IconEdit />
          </button>
          <div className="tprog">
            {done}/{total}
          </div>
        </div>
      </header>

      <div className="prog" style={{ marginTop: 2 }}>
        <div className="ring" style={{ '--p': pct } as CSSProperties}>
          <b>{pct}%</b>
        </div>
        <div style={{ flex: 1 }}>
          <div className="pl">{done} of {total} exercises done</div>
          <div className="ps">Log your sets · tap ⬤ when done</div>
        </div>
      </div>

      {session.slots.map((sl, i) => {
        const key = keyOf(state.plan, cur, sl[0]);
        const st: LiveSlotState | undefined = state.live[key];
        if (!st) return null;
        // Progression hint + "use last time" both key off the most recent logged
        // session for this slot on the current equipment kind.
        const lastSets = lastFor(historyEntries, sl[0], st.kind);
        const suggestion = lastSets && lastSets[0] ? progressionTarget(st.kind, lastSets[0]) : null;
        return (
          <ExerciseCard
            key={key}
            index={i}
            slotDef={sl}
            plan={P}
            state={st}
            loggedKinds={kindsLoggedFor(historyEntries, sl[0])}
            editing={editing}
            addedTag={oneOffNames.includes(sl[0]) ? 'today' : addedNames.has(sl[0]) ? 'added' : null}
            canMoveUp={i > 0}
            canMoveDown={i < session.slots.length - 1}
            suggestion={suggestion}
            lastSets={lastSets ? lastSets.map((s) => ({ w: s.w ?? '', r: s.r ?? '' })) : null}
            autofill={autofill}
            onToggleAutofill={toggleAutofill}
            onRest={() => startRest()}
            onMoveUp={() => handleMove(sl[0], -1)}
            onMoveDown={() => handleMove(sl[0], 1)}
            onRemove={() => handleRemove(sl[0])}
            onToggleDone={() => handleToggleDone(key, sl[0], st)}
            onToggleForce={() => dispatch({ type: 'TOGGLE_FORCE', key })}
            onKindChange={(kind) => {
              const weighted = kind !== 'bw';
              const timeBased = isTimeScheme(sl[1]);
              const lp = lastFor(historyEntries, sl[0], kind);
              const hasInput = (st.sets ?? []).some((x) => x.w !== '' || x.r !== '');
              const sets: LiveSet[] = hasInput
                ? (st.sets ?? []).map((x, j) => ({ ...x, last: fmtLast(lp?.[j], weighted, timeBased) }))
                : Array.from({ length: parseTarget(sl[1]) }, (_, j) => ({ w: '', r: '', last: fmtLast(lp?.[j], weighted, timeBased) }));
              dispatch({ type: 'SET_KIND', key, planSlotKey: `${state.plan}|${sl[0]}`, kind, sets });
            }}
            onSetChange={(idx, field, value) => dispatch({ type: 'UPDATE_SET', key, index: idx, field, value })}
            onToggleSetDone={(index) => dispatch({ type: 'TOGGLE_SET_DONE', key, index })}
            onAddSet={() => dispatch({ type: 'ADD_SET', key })}
            onDeleteSet={(index) => dispatch({ type: 'REMOVE_SET', key, index })}
            onZoom={setZoom}
          />
        );
      })}

      <button className="addex" onClick={() => setPicking(true)}>
        <IconPlus /> Add exercise
      </button>

      {editing && canReset && (
        <button className="resetplan" onClick={handleReset} disabled={resetCustomization.isPending}>
          Reset {session.name} to the default plan
        </button>
      )}

      <AddExerciseSheet
        open={picking}
        onClose={() => setPicking(false)}
        plan={P}
        session={session}
        sessionName={session.name}
        onAdd={handleAdd}
        busy={saveCustomization.isPending}
      />

      <Dock onSave={handleSave} onFinish={handleFinish} hidden={false} />
      <Lightbox src={zoom} onClose={() => setZoom(null)} />

      <PrBurstStack items={bursts} onDone={dismissBurst} />

      {restSeconds != null && (
        <RestTimer key={restNonce} seconds={restSeconds} onClose={() => setRestSeconds(null)} />
      )}

      {celebration && (
        <CompletionCelebration
          summary={celebration}
          onDone={() => {
            setCelebration(null);
            goHome();
          }}
        />
      )}
    </>
  );
}
