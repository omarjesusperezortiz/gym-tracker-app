import { getSupabase } from './client';
import type { Plan, Session, Slot } from '../types';

// ── Session customizations (base + overlay) ───────────────────
// Base sessions live in catalog.ts (shared, versioned, improvable). This overlay
// stores only a user's DELTAS. effectiveSession(base, overlay) merges them into
// the session the user actually trains. One overlay row per (user, plan, sess).

export interface AddedSlot {
  slot: string; // catalog variations key, or a custom free-typed name
  scheme: string; // e.g. "3 × 8–12"
  force?: string; // optional heavy-scheme label
  custom?: boolean; // true = free-typed name with no catalog variation
}

export interface SessionOverlay {
  added: AddedSlot[];
  hidden: string[]; // base slot names removed
  ordering: string[]; // explicit order of slot names; empty = natural
}

export const EMPTY_OVERLAY: SessionOverlay = { added: [], hidden: [], ordering: [] };

// Pure merge: base session + overlay → the effective session to train.
// - drops hidden base slots
// - appends added slots (default scheme "3 × 8–12" if missing)
// - applies explicit ordering when present (names not listed keep their relative order after)
export function effectiveSession(base: Session, overlay: SessionOverlay | null | undefined): Session {
  const ov = overlay ?? EMPTY_OVERLAY;
  const hidden = new Set(ov.hidden);

  const kept: Slot[] = base.slots.filter((s) => !hidden.has(s[0]));
  const added: Slot[] = ov.added.map((a) => [a.slot, a.scheme || '3 × 8–12', a.force ?? ''] as Slot);
  let slots: Slot[] = [...kept, ...added];

  if (ov.ordering.length) {
    const rank = new Map(ov.ordering.map((name, i) => [name, i]));
    slots = slots
      .map((s, i) => ({ s, i }))
      .sort((a, b) => {
        const ra = rank.has(a.s[0]) ? (rank.get(a.s[0]) as number) : Number.MAX_SAFE_INTEGER;
        const rb = rank.has(b.s[0]) ? (rank.get(b.s[0]) as number) : Number.MAX_SAFE_INTEGER;
        return ra - rb || a.i - b.i; // stable for unranked
      })
      .map((x) => x.s);
  }

  return { ...base, slots };
}

// A merged Plan whose sessions reflect the user's overlays. variations/cues are
// untouched — added catalog slots reuse the plan's existing variations. Custom
// (free-typed) slots have no variation, which the UI renders as a bare row.
export function effectivePlan(base: Plan, overlays: Record<string, SessionOverlay>): Plan {
  const sessions: Record<string, Session> = {};
  for (const [key, sess] of Object.entries(base.sessions)) {
    sessions[key] = effectiveSession(sess, overlays[key]);
  }
  return { ...base, sessions };
}

// ── Supabase queries ──────────────────────────────────────────
export interface StoredCustomization extends SessionOverlay {
  plan: string;
  sess: string;
}

export async function fetchCustomizations(): Promise<StoredCustomization[]> {
  const { data, error } = await getSupabase()
    .from('session_customizations')
    .select('plan, sess, added, hidden, ordering');
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      plan: row.plan as string,
      sess: row.sess as string,
      added: (row.added as AddedSlot[]) ?? [],
      hidden: (row.hidden as string[]) ?? [],
      ordering: (row.ordering as string[]) ?? [],
    };
  });
}

export async function saveCustomization(plan: string, sess: string, overlay: SessionOverlay): Promise<void> {
  const { data: userRes } = await getSupabase().auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('not authenticated');
  const { error } = await getSupabase().from('session_customizations').upsert(
    {
      user_id: userId,
      plan,
      sess,
      added: overlay.added,
      hidden: overlay.hidden,
      ordering: overlay.ordering,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,plan,sess' }
  );
  if (error) throw error;
}

// "Reset to default" — remove the overlay entirely so the session is pure base.
export async function resetCustomization(plan: string, sess: string): Promise<void> {
  const { data: userRes } = await getSupabase().auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('not authenticated');
  const { error } = await getSupabase()
    .from('session_customizations')
    .delete()
    .eq('user_id', userId)
    .eq('plan', plan)
    .eq('sess', sess);
  if (error) throw error;
}
