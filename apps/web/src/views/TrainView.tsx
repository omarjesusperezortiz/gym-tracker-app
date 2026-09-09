import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { catalog, finishWorkout, fmtLast, isTimeScheme, lastFor, parseTarget } from '@gym-tracker/core';
import type { Kind, Variation } from '@gym-tracker/core';
import { keyOf, useAppState, type LiveSet, type LiveSlotState } from '../state/AppState';
import { useWorkouts } from '../lib/useWorkouts';
import { toHistorySlotEntries, updateWorkout } from '../lib/workouts';
import { useToast } from '../components/Toast';
import { Dock } from '../components/Dock';
import { Lightbox } from '../components/Lightbox';
import { ExerciseCard } from './ExerciseCard';
import { IconBack, IconClose, IconEdit } from '../lib/icons';

function firstKind(variations: Partial<Record<Kind, Variation>> | undefined): Kind {
  const keys = variations ? (Object.keys(variations) as Kind[]) : [];
  return keys[0] || 'bw';
}

export function TrainView() {
  const { state, dispatch } = useAppState();
  const { history, loading, refetch } = useWorkouts();
  const { toast } = useToast();
  const [zoom, setZoom] = useState<string | null>(null);

  const historyEntries = useMemo(() => toHistorySlotEntries(history), [history]);
  const P = catalog.plans[state.plan];
  const keys = Object.keys(P.sessions);
  const cur = state.cur && keys.includes(state.cur) ? state.cur : keys[0];
  const session = P.sessions[cur];

  // Populate any not-yet-seen slot with its default equipment + a fresh set of
  // inputs pre-filled with the "last time" hint, exactly once per slot.
  useEffect(() => {
    if (loading) return;
    session.slots.forEach((sl) => {
      const [slot, scheme] = sl;
      const key = keyOf(state.plan, cur, slot);
      if (state.live[key]) return;
      const kind = state.pref[`${state.plan}|${slot}`] || firstKind(P.variations[slot]);
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
  }, [loading, state.plan, cur, historyEntries]);

  const done = session.slots.filter((sl) => state.live[keyOf(state.plan, cur, sl[0])]?.done).length;
  const total = session.slots.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const isEditingCurrent = state.editingId != null && state.editingKey === `${state.plan}|${cur}`;

  function goHome() {
    dispatch({ type: 'GO_HOME' });
  }

  function handleSave() {
    toast('Progress saved 💾');
  }

  function cancelEdit() {
    dispatch({ type: 'CANCEL_EDIT', keys: session.slots.map((sl) => keyOf(state.plan, cur, sl[0])) });
    toast('Edit discarded');
    goHome();
  }

  async function handleFinish() {
    const slots: { slot: string; kind: Kind; done: boolean; force: boolean; sets: { w: string; r: string }[] }[] = [];
    session.slots.forEach((sl) => {
      const slot = sl[0];
      const key = keyOf(state.plan, cur, slot);
      const st = state.live[key];
      if (!st) return;
      const sets = (st.sets ?? []).filter((x) => x.w !== '' || x.r !== '').map((x) => ({ w: x.w, r: x.r }));
      if (sets.length || st.done) slots.push({ slot, kind: st.kind, done: st.done, force: !!st.force, sets });
    });
    if (!slots.length) {
      toast('Log something first 💪');
      return;
    }
    try {
      if (isEditingCurrent && state.editingId) {
        await updateWorkout(state.editingId, { plan: state.plan, sess: cur, name: session.name, slots });
        toast(`${session.name} updated ✏️`);
      } else {
        await finishWorkout({ date: new Date().toISOString(), plan: state.plan, sess: cur, name: session.name, slots });
        toast(`${session.name} finished! 🎉`);
      }
      dispatch({ type: 'CLEAR_SLOTS', keys: session.slots.map((sl) => keyOf(state.plan, cur, sl[0])) });
      goHome();
      void refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save workout');
    }
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
              {session.emoji} {session.name}
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
        return (
          <ExerciseCard
            key={key}
            index={i}
            slotDef={sl}
            plan={P}
            state={st}
            onToggleDone={() => dispatch({ type: 'TOGGLE_DONE', key })}
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
            onAddSet={() => dispatch({ type: 'ADD_SET', key })}
            onZoom={setZoom}
          />
        );
      })}

      <Dock onSave={handleSave} onFinish={() => void handleFinish()} hidden={false} />
      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </>
  );
}
