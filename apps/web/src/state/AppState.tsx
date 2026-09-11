// In-progress "draft" state: which plan/session is open, and per-exercise entries
// being typed in on the Train screen. Mirrors the original app's `live` + `pref`
// globals, persisted to localStorage so a reload never loses unsaved sets.
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { catalog } from '@gym-tracker/core';
import type { AddedSlot, Kind, PlanKey } from '@gym-tracker/core';
import { LS_DRAFT, LS_ONEOFF, LS_PLAN, LS_PREF, readJSON, writeJSON } from '../lib/storage';

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

export function keyOf(plan: string, sess: string | null, slot: string): string {
  return `${plan}|${sess ?? ''}|${slot}`;
}

export interface State {
  plan: PlanKey;
  view: View;
  cur: string | null;
  live: LiveMap;
  pref: PrefMap;
  oneOff: OneOffMap;
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
  | { type: 'REMOVE_LIVE_SLOT'; sessionKey: string; slot: string; key: string };

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
      return { ...state, live: { ...state.live, [action.key]: { ...cur, done: !cur.done } } };
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
      return { ...state, live: { ...state.live, [action.key]: { ...cur, sets } } };
    }
    case 'TOGGLE_SET_DONE': {
      const cur = state.live[action.key];
      if (!cur || !cur.sets) return state;
      const sets = cur.sets.slice();
      sets[action.index] = { ...sets[action.index], done: !sets[action.index].done };
      return { ...state, live: { ...state.live, [action.key]: { ...cur, sets } } };
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
      // Always called right after a successful Finish (insert or update) for the
      // CURRENT session, so it also exits any edit mode that session was in and
      // drops today's one-off additions — they were for that workout only.
      const live = { ...state.live };
      action.keys.forEach((k) => delete live[k]);
      return { ...state, live, oneOff: clearOneOff(state.oneOff, action.sessionKey), editingId: null, editingKey: null };
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
      return { ...state, live, oneOff: clearOneOff(state.oneOff, action.sessionKey), editingId: null, editingKey: null };
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
    default:
      return state;
  }
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
  // Persisted alongside the draft: without it a reload would drop the added
  // exercise while its typed sets stayed in `live`, orphaned and unsaveable.
  const oneOff = readJSON<OneOffMap>(LS_ONEOFF, {});
  return {
    plan: catalog.plans[plan] ? plan : 'gym',
    view: 'today',
    cur: null,
    live,
    pref,
    oneOff,
    editingId: null,
    editingKey: null,
  };
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
  useEffect(() => writeJSON(LS_ONEOFF, state.oneOff), [state.oneOff]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
