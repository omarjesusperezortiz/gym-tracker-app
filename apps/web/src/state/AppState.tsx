// In-progress "draft" state: which plan/session is open, and per-exercise entries
// being typed in on the Train screen. Mirrors the original app's `live` + `pref`
// globals, persisted to localStorage so a reload never loses unsaved sets.
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { catalog, variantKey } from '@gym-tracker/core';
import type { AddedSlot, Kind, LevelKey, PlanKey } from '@gym-tracker/core';
import {
  LS_ACTIVE_VARIANT,
  LS_DRAFT,
  LS_DRAFT_DATES,
  LS_ONEOFF,
  LS_PLAN,
  LS_PREF,
  LS_TRAVEL_LEVEL,
  readJSON,
  writeJSON,
} from '../lib/storage';
import { liveKeysBySession, localDateKey, msUntilNextMidnight, sessionKeyOf, staleSessions } from '../lib/draftExpiry';

export type View = 'today' | 'home' | 'train' | 'calendar' | 'progress' | 'meals' | 'exercises' | 'profile';

export interface LiveSet {
  w: string;
  r: string;
  last: string;
  /** Per-set completion tick (layout A). Optional so old persisted sets default to undone. */
  done?: boolean;
}

export interface LiveSlotState {
  kind: Kind;
  done: boolean;
  force: boolean;
  sets: LiveSet[] | null;
}

export type LiveMap = Record<string, LiveSlotState>;
export type PrefMap = Record<string, Kind>;
/** Exercises added for TODAY only, keyed `${plan}|${sess}`. Merged into the
 *  session for rendering and saved with the workout, but never written to the
 *  session_customizations overlay. */
export type OneOffMap = Record<string, AddedSlot[]>;
/** User-chosen travel difficulty per split (e.g. `fullbody` → 'hard'). A split
 *  missing here uses the auto level picked from history (lib/travelLevel.ts). */
export type TravelLevelMap = Record<string, LevelKey>;
/** Chosen style variant (e.g. "Diamond Push-Up") keyed `${slot}|${kind}`. A
 *  missing key means the slot's default (first) variant. */
export type ActiveVariantMap = Record<string, string>;
/** Local date (YYYY-MM-DD) each draft session got its first value, keyed
 *  `${plan}|${sess}`. A session stamped on an earlier day is discarded. */
export type DraftDateMap = Record<string, string>;

export function keyOf(plan: string, sess: string | null, slot: string): string {
  return `${plan}|${sess ?? ''}|${slot}`;
}

export interface State {
  plan: PlanKey;
  view: View;
  cur: string | null;
  live: LiveMap;
  draftDates: DraftDateMap;
  pref: PrefMap;
  oneOff: OneOffMap;
  travelLevel: TravelLevelMap;
  activeVariant: ActiveVariantMap;
  // Set while re-opening a PAST, already-finished workout for editing (Calendar's
  // "Continue / edit this workout"). editingKey is `${plan}|${sess}` — Finish updates
  // that workout row instead of inserting a new one only while it still matches.
  editingId: string | null;
  editingKey: string | null;
}

type Action =
  | { type: 'SET_PLAN'; plan: PlanKey }
  | { type: 'SET_VIEW'; view: View }
  | { type: 'OPEN_SESSION'; plan: PlanKey; sess: string }
  | { type: 'GO_HOME' }
  | { type: 'ENSURE_SLOT'; key: string; slot: LiveSlotState }
  | { type: 'TOGGLE_DONE'; key: string }
  | { type: 'TOGGLE_FORCE'; key: string }
  | { type: 'SET_KIND'; key: string; planSlotKey: string; kind: Kind; sets: LiveSet[] | null }
  | { type: 'UPDATE_SET'; key: string; index: number; field: 'w' | 'r'; value: string }
  | { type: 'TOGGLE_SET_DONE'; key: string; index: number }
  | { type: 'ADD_SET'; key: string }
  | { type: 'REMOVE_SET'; key: string; index: number }
  | { type: 'CLEAR_SLOTS'; keys: string[]; sessionKey?: string }
  | { type: 'EDIT_ENTRY'; plan: PlanKey; sess: string; entryId: string; live: LiveMap }
  | { type: 'CANCEL_EDIT'; keys: string[]; sessionKey?: string }
  | { type: 'ADD_LIVE_SLOT'; sessionKey: string; slot: AddedSlot }
  | { type: 'REMOVE_LIVE_SLOT'; sessionKey: string; slot: string; key: string }
  // level null clears the override, handing the split back to auto-level.
  | { type: 'SET_TRAVEL_LEVEL'; split: string; level: LevelKey | null }
  | { type: 'SET_ACTIVE_VARIANT'; slot: string; kind: string; name: string };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PLAN':
      return { ...state, plan: action.plan, cur: null };
    case 'SET_VIEW':
      return { ...state, view: action.view };
    case 'OPEN_SESSION': {
      // Opening a different session than the one being edited drops the stale edit
      // context — Finish must never silently update an unrelated past workout.
      const staleEdit = state.editingKey != null && state.editingKey !== `${action.plan}|${action.sess}`;
      return {
        ...state,
        plan: action.plan,
        cur: action.sess,
        view: 'train',
        editingId: staleEdit ? null : state.editingId,
        editingKey: staleEdit ? null : state.editingKey,
      };
    }
    case 'GO_HOME':
      return { ...state, view: 'home' };
    case 'ENSURE_SLOT':
      if (state.live[action.key]) return state;
      return { ...state, live: { ...state.live, [action.key]: action.slot } };
    case 'TOGGLE_DONE': {
      const cur = state.live[action.key];
      if (!cur) return state;
      const next = { ...state, live: { ...state.live, [action.key]: { ...cur, done: !cur.done } } };
      return cur.done ? next : stampDraft(next, action.key);
    }
    case 'TOGGLE_FORCE': {
      const cur = state.live[action.key];
      if (!cur) return state;
      return { ...state, live: { ...state.live, [action.key]: { ...cur, force: !cur.force } } };
    }
    case 'SET_KIND': {
      const cur = state.live[action.key];
      if (!cur) return state;
      return {
        ...state,
        live: { ...state.live, [action.key]: { ...cur, kind: action.kind, sets: action.sets } },
        pref: { ...state.pref, [action.planSlotKey]: action.kind },
      };
    }
    case 'UPDATE_SET': {
      const cur = state.live[action.key];
      if (!cur || !cur.sets) return state;
      const sets = cur.sets.slice();
      sets[action.index] = { ...sets[action.index], [action.field]: action.value };
      const next = { ...state, live: { ...state.live, [action.key]: { ...cur, sets } } };
      return action.value ? stampDraft(next, action.key) : next;
    }
    case 'TOGGLE_SET_DONE': {
      const cur = state.live[action.key];
      if (!cur || !cur.sets) return state;
      const sets = cur.sets.slice();
      const wasDone = !!sets[action.index].done;
      sets[action.index] = { ...sets[action.index], done: !wasDone };
      const next = { ...state, live: { ...state.live, [action.key]: { ...cur, sets } } };
      return wasDone ? next : stampDraft(next, action.key);
    }
    case 'ADD_SET': {
      const cur = state.live[action.key];
      if (!cur) return state;
      // Only stores what the user types — an added set is empty and shows the
      // cascading "ghost" of the set above as a placeholder (see effectiveSets).
      const sets = [...(cur.sets ?? []), { w: '', r: '', last: '' }];
      return { ...state, live: { ...state.live, [action.key]: { ...cur, sets } } };
    }
    case 'REMOVE_SET': {
      const cur = state.live[action.key];
      if (!cur) return state;
      // Keep at least one set — you can clear a set's values but not remove the
      // last row (an exercise with zero sets makes no sense to log).
      const existing = cur.sets ?? [];
      if (existing.length <= 1) return state;
      const sets = existing.filter((_, i) => i !== action.index);
      return { ...state, live: { ...state.live, [action.key]: { ...cur, sets } } };
    }
    case 'CLEAR_SLOTS': {
      // Called after a successful Finish (insert or update) for the CURRENT
      // session, so it also exits any edit mode that session was in and drops
      // today's one-off additions — they were for that workout only. Also used to
      // discard a session (Home dismiss, midnight expiry): edit mode of a
      // DIFFERENT session survives that.
      const live = { ...state.live };
      action.keys.forEach((k) => delete live[k]);
      const exitsEdit = !action.sessionKey || action.sessionKey === state.editingKey;
      return {
        ...state,
        live,
        draftDates: clearDraftDate(state.draftDates, action.sessionKey),
        oneOff: clearOneOff(state.oneOff, action.sessionKey),
        editingId: exitsEdit ? null : state.editingId,
        editingKey: exitsEdit ? null : state.editingKey,
      };
    }
    case 'EDIT_ENTRY':
      return {
        ...state,
        plan: action.plan,
        cur: action.sess,
        view: 'train',
        live: { ...state.live, ...action.live },
        editingId: action.entryId,
        editingKey: `${action.plan}|${action.sess}`,
      };
    case 'CANCEL_EDIT': {
      const live = { ...state.live };
      action.keys.forEach((k) => delete live[k]);
      return {
        ...state,
        live,
        draftDates: clearDraftDate(state.draftDates, action.sessionKey),
        oneOff: clearOneOff(state.oneOff, action.sessionKey),
        editingId: null,
        editingKey: null,
      };
    }
    case 'ADD_LIVE_SLOT': {
      const existing = state.oneOff[action.sessionKey] ?? [];
      if (existing.some((a) => a.slot === action.slot.slot)) return state;
      return { ...state, oneOff: { ...state.oneOff, [action.sessionKey]: [...existing, action.slot] } };
    }
    case 'REMOVE_LIVE_SLOT': {
      const existing = state.oneOff[action.sessionKey] ?? [];
      const live = { ...state.live };
      delete live[action.key];
      return {
        ...state,
        live,
        oneOff: { ...state.oneOff, [action.sessionKey]: existing.filter((a) => a.slot !== action.slot) },
      };
    }
    case 'SET_TRAVEL_LEVEL': {
      const travelLevel = { ...state.travelLevel };
      if (action.level) travelLevel[action.split] = action.level;
      else delete travelLevel[action.split];
      return { ...state, travelLevel };
    }
    case 'SET_ACTIVE_VARIANT':
      return { ...state, activeVariant: { ...state.activeVariant, [variantKey(action.slot, action.kind)]: action.name } };
    default:
      return state;
  }
}

/** Stamp the draft's session with today's local date unless already stamped. */
function stampDraft(state: State, liveKey: string): State {
  const sk = sessionKeyOf(liveKey);
  if (state.draftDates[sk]) return state;
  return { ...state, draftDates: { ...state.draftDates, [sk]: localDateKey() } };
}

function clearDraftDate(dates: DraftDateMap, sessionKey: string | undefined): DraftDateMap {
  if (!sessionKey || !dates[sessionKey]) return dates;
  const next = { ...dates };
  delete next[sessionKey];
  return next;
}

/** CLEAR_SLOTS for every draft session stamped on a day other than `today`. */
export function expiryActions(state: Pick<State, 'live' | 'draftDates'>, today: string): Action[] {
  const bySession = liveKeysBySession(state.live);
  return staleSessions(state.draftDates, today).map((sessionKey) => ({
    type: 'CLEAR_SLOTS' as const,
    keys: bySession[sessionKey] ?? [],
    sessionKey,
  }));
}

/**
 * Load-time draft housekeeping: discard sessions from an earlier day, and stamp
 * drafts persisted before stamping existed as today (they expire tonight rather
 * than vanishing on update).
 */
export function expireOnLoad(state: State, today: string): State {
  let next = expiryActions(state, today).reduce(reducer, state);
  const draftDates: DraftDateMap = {};
  for (const sk of Object.keys(liveKeysBySession(next.live))) draftDates[sk] = next.draftDates[sk] ?? today;
  next = { ...next, draftDates };
  return next;
}

function clearOneOff(oneOff: OneOffMap, sessionKey: string | undefined): OneOffMap {
  if (!sessionKey || !oneOff[sessionKey]) return oneOff;
  const next = { ...oneOff };
  delete next[sessionKey];
  return next;
}

function initialState(): State {
  const plan = readJSON<PlanKey>(LS_PLAN, 'gym');
  const pref = readJSON<PrefMap>(LS_PREF, {});
  const live = readJSON<LiveMap>(LS_DRAFT, {});
  const draftDates = readJSON<DraftDateMap>(LS_DRAFT_DATES, {});
  // Persisted alongside the draft: without it a reload would drop the added
  // exercise while its typed sets stayed in `live`, orphaned and unsaveable.
  const oneOff = readJSON<OneOffMap>(LS_ONEOFF, {});
  const travelLevel = readJSON<TravelLevelMap>(LS_TRAVEL_LEVEL, {});
  const activeVariant = readJSON<ActiveVariantMap>(LS_ACTIVE_VARIANT, {});
  const loaded: State = {
    plan: catalog.plans[plan] ? plan : 'gym',
    view: 'today',
    cur: null,
    live,
    draftDates,
    pref,
    oneOff,
    travelLevel,
    activeVariant,
    editingId: null,
    editingKey: null,
  };
  return expireOnLoad(loaded, localDateKey());
}

interface AppStateContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => writeJSON(LS_PLAN, state.plan), [state.plan]);
  useEffect(() => writeJSON(LS_PREF, state.pref), [state.pref]);
  useEffect(() => writeJSON(LS_DRAFT, state.live), [state.live]);
  useEffect(() => writeJSON(LS_DRAFT_DATES, state.draftDates), [state.draftDates]);
  useEffect(() => writeJSON(LS_ONEOFF, state.oneOff), [state.oneOff]);
  useEffect(() => writeJSON(LS_TRAVEL_LEVEL, state.travelLevel), [state.travelLevel]);
  useEffect(() => writeJSON(LS_ACTIVE_VARIANT, state.activeVariant), [state.activeVariant]);

  // Expire yesterday's drafts while the app stays open: at the next local
  // midnight, and whenever the app comes back (phone resumed, tab refocused) —
  // background timers are throttled, so the timer alone can't be trusted.
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const expire = () => expiryActions(stateRef.current, localDateKey()).forEach(dispatch);
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        expire();
        schedule();
      }, msUntilNextMidnight() + 1000);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') expire();
    };
    schedule();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', expire);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', expire);
    };
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
