import type { Kind, LoggedSet } from '@gym-tracker/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── In-progress workout drafts ───────────────────────────────
// Keyed by plan+session so a user can have several sessions in progress at
// once (mirrors the web app's per-key `live` object, split out per session).
export interface DraftSlot {
  kind: Kind;
  done: boolean;
  force: boolean;
  sets: LoggedSet[];
}
export type Draft = Record<string, DraftSlot>; // keyed by slot name

const DRAFT_PREFIX = 'draft:';

export function draftKey(plan: string, sess: string) {
  return `${DRAFT_PREFIX}${plan}:${sess}`;
}

export async function loadDraft(plan: string, sess: string): Promise<Draft> {
  const raw = await AsyncStorage.getItem(draftKey(plan, sess));
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return {};
  }
}

export async function saveDraft(plan: string, sess: string, draft: Draft): Promise<void> {
  await AsyncStorage.setItem(draftKey(plan, sess), JSON.stringify(draft));
}

export async function clearDraft(plan: string, sess: string): Promise<void> {
  await AsyncStorage.removeItem(draftKey(plan, sess));
}

export interface InProgressSession {
  plan: string;
  sess: string;
  done: number;
  total: number;
}

// Scans every stored draft for sessions with any logged data — used by the
// Home dashboard's "continue where you left off" list.
export async function listInProgress(totalForSlot: (plan: string, sess: string) => number | null): Promise<InProgressSession[]> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(DRAFT_PREFIX));
  if (!keys.length) return [];
  const pairs = await AsyncStorage.multiGet(keys);
  const entries: Record<string, string | null> = {};
  for (const [k, v] of pairs) entries[k] = v;
  const out: InProgressSession[] = [];
  for (const key of keys) {
    const raw = entries[key];
    const rest = key.slice(DRAFT_PREFIX.length);
    const sepIdx = rest.indexOf(':');
    if (sepIdx < 0) continue;
    const plan = rest.slice(0, sepIdx);
    const sess = rest.slice(sepIdx + 1);
    const total = totalForSlot(plan, sess);
    if (total == null) continue; // session no longer exists in the catalog
    let draft: Draft = {};
    try {
      draft = raw ? (JSON.parse(raw) as Draft) : {};
    } catch {
      continue;
    }
    let done = 0;
    let hasAny = false;
    for (const slot of Object.values(draft)) {
      const hasSets = slot.sets?.some((s) => s.w || s.r);
      if (slot.done || hasSets) {
        hasAny = true;
        done++;
      }
    }
    if (hasAny) out.push({ plan, sess, done, total });
  }
  return out;
}

// ── Preferred equipment kind per (plan, slot) ────────────────
const KIND_PREFS_KEY = 'kindPrefs';

export async function loadKindPrefs(): Promise<Record<string, Kind>> {
  const raw = await AsyncStorage.getItem(KIND_PREFS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, Kind>;
  } catch {
    return {};
  }
}

export async function saveKindPref(plan: string, slot: string, kind: Kind): Promise<void> {
  const prefs = await loadKindPrefs();
  prefs[`${plan}|${slot}`] = kind;
  await AsyncStorage.setItem(KIND_PREFS_KEY, JSON.stringify(prefs));
}

// ── Selected plan (persisted plan-chip choice) ───────────────
const SELECTED_PLAN_KEY = 'selectedPlan';

export async function loadSelectedPlan(): Promise<string | null> {
  return AsyncStorage.getItem(SELECTED_PLAN_KEY);
}

export async function saveSelectedPlan(plan: string): Promise<void> {
  await AsyncStorage.setItem(SELECTED_PLAN_KEY, plan);
}
