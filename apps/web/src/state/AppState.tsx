// In-progress "draft" state: which plan/session is open, and per-exercise entries
// being typed in on the Train screen. Mirrors the original app's `live` + `pref`
// globals, persisted to localStorage so a reload never loses unsaved sets.
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { catalog } from '@gym-tracker/core';
import type { Kind, PlanKey } from '@gym-tracker/core';
import { LS_DRAFT, LS_PLAN, LS_PREF, readJSON, writeJSON } from '../lib/storage';

export type View = 'today' | 'home' | 'train' | 'calendar' | 'progress' | 'meals';

export interface LiveSet {
  w: string;
  r: string;
  last: string;
}

export interface LiveSlotState {
  kind: Kind;
  done: boolean;
  force: boolean;
  sets: LiveSet[] | null;
}

export type LiveMap = Record<string, LiveSlotState>;
export type PrefMap = Record<string, Kind>;

export function keyOf(plan: string, sess: string | null, slot: string): string {
  return `${plan}|${sess ?? ''}|${slot}`;
}

interface State {
  plan: PlanKey;
  view: View;
  cur: string | null;
  live: LiveMap;
  pref: PrefMap;
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
  | { type: 'ADD_SET'; key: string }
  | { type: 'CLEAR_SLOTS'; keys: string[] }
  | { type: 'EDIT_ENTRY'; plan: PlanKey; sess: string; entryId: string; live: LiveMap }
  | { type: 'CANCEL_EDIT'; keys: string[] };

function reducer(state: State, action: Action): State {
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
    case 'ADD_SET': {
      const cur = state.live[action.key];
      if (!cur) return state;
      const sets = [...(cur.sets ?? []), { w: '', r: '', last: '' }];
      return { ...state, live: { ...state.live, [action.key]: { ...cur, sets } } };
    }
    case 'CLEAR_SLOTS': {
      // Always called right after a successful Finish (insert or update) for the
      // CURRENT session, so it also exits any edit mode that session was in.
      const live = { ...state.live };
      action.keys.forEach((k) => delete live[k]);
      return { ...state, live, editingId: null, editingKey: null };
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
      return { ...state, live, editingId: null, editingKey: null };
    }
    default:
      return state;
  }
}

function initialState(): State {
  const plan = readJSON<PlanKey>(LS_PLAN, 'gym');
  const pref = readJSON<PrefMap>(LS_PREF, {});
  const live = readJSON<LiveMap>(LS_DRAFT, {});
  return {
    plan: catalog.plans[plan] ? plan : 'gym',
    view: 'today',
    cur: null,
    live,
    pref,
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

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
