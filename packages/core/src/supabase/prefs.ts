import { getSupabase } from './client';

// ── User preferences ──────────────────────────────────────────
export interface UserPrefs {
  units: 'kg' | 'lb';
  defaultPlan: string;
  restSeconds: number;
}

export async function fetchPrefs(): Promise<UserPrefs | null> {
  const { data, error } = await getSupabase()
    .from('user_prefs')
    .select('units, default_plan, rest_seconds')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { units: data.units, defaultPlan: data.default_plan, restSeconds: data.rest_seconds };
}

export async function savePrefs(prefs: Partial<UserPrefs>): Promise<void> {
  const { data: userRes } = await getSupabase().auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('not authenticated');
  const row: Record<string, unknown> = { user_id: userId };
  if (prefs.units !== undefined) row.units = prefs.units;
  if (prefs.defaultPlan !== undefined) row.default_plan = prefs.defaultPlan;
  if (prefs.restSeconds !== undefined) row.rest_seconds = prefs.restSeconds;
  const { error } = await getSupabase().from('user_prefs').upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}

// ── Bodyweight log ────────────────────────────────────────────
export interface BodyweightEntry {
  id: string;
  date: string;
  weightKg: number;
  note: string | null;
}

export async function fetchBodyweight(): Promise<BodyweightEntry[]> {
  const { data, error } = await getSupabase()
    .from('bodyweight_log')
    .select('id, date, weight_kg, note')
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, date: r.date, weightKg: Number(r.weight_kg), note: r.note }));
}

export async function logBodyweight(date: string, weightKg: number, note?: string): Promise<void> {
  const { data: userRes } = await getSupabase().auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('not authenticated');
  const { error } = await getSupabase()
    .from('bodyweight_log')
    .upsert({ user_id: userId, date, weight_kg: weightKg, note: note ?? null }, { onConflict: 'user_id,date' });
  if (error) throw error;
}

// ── Personal records (from the personal_records view) ─────────
export interface PersonalRecord {
  slot: string;
  bestWeight: number | null;
  bestVolume: number | null;
}

export async function fetchPersonalRecords(): Promise<PersonalRecord[]> {
  const { data, error } = await getSupabase()
    .from('personal_records')
    .select('slot, best_weight, best_volume')
    .order('best_weight', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    slot: r.slot,
    bestWeight: r.best_weight != null ? Number(r.best_weight) : null,
    bestVolume: r.best_volume != null ? Number(r.best_volume) : null,
  }));
}
