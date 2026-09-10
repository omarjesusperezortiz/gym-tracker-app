import { getSupabase } from './client';

// ── User preferences + profile (onboarding) ───────────────────
export type Goal = 'muscle' | 'fat_loss' | 'strength' | 'maintain' | 'endurance';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'full_gym' | 'home' | 'bodyweight';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs';

export interface UserPrefs {
  units: 'kg' | 'lb';
  defaultPlan: string;
  restSeconds: number;
  // profile / onboarding
  displayName: string | null;
  sex: string | null;
  birthYear: number | null;
  heightCm: number | null;
  goalWeightKg: number | null;
  goal: Goal;
  focusMuscles: MuscleGroup[];
  experience: Experience;
  daysPerWeek: number;
  sessionMin: number;
  equipment: Equipment;
  onboarded: boolean;
}

const PREFS_COLUMNS =
  'units, default_plan, rest_seconds, display_name, sex, birth_year, height_cm, ' +
  'goal_weight_kg, goal, focus_muscles, experience, days_per_week, session_min, equipment, onboarded';

export async function fetchPrefs(): Promise<UserPrefs | null> {
  const { data: raw, error } = await getSupabase()
    .from('user_prefs')
    .select(PREFS_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (!raw) return null;
  const data = raw as unknown as Record<string, unknown>;
  return {
    units: data.units as 'kg' | 'lb',
    defaultPlan: data.default_plan as string,
    restSeconds: data.rest_seconds as number,
    displayName: (data.display_name as string) ?? null,
    sex: (data.sex as string) ?? null,
    birthYear: (data.birth_year as number) ?? null,
    heightCm: data.height_cm != null ? Number(data.height_cm) : null,
    goalWeightKg: data.goal_weight_kg != null ? Number(data.goal_weight_kg) : null,
    goal: (data.goal ?? 'muscle') as Goal,
    focusMuscles: (data.focus_muscles ?? []) as MuscleGroup[],
    experience: (data.experience ?? 'intermediate') as Experience,
    daysPerWeek: (data.days_per_week as number) ?? 4,
    sessionMin: (data.session_min as number) ?? 60,
    equipment: (data.equipment ?? 'full_gym') as Equipment,
    onboarded: !!data.onboarded,
  };
}

export async function savePrefs(prefs: Partial<UserPrefs>): Promise<void> {
  const { data: userRes } = await getSupabase().auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('not authenticated');
  const row: Record<string, unknown> = { user_id: userId };
  const map: Record<keyof UserPrefs, string> = {
    units: 'units',
    defaultPlan: 'default_plan',
    restSeconds: 'rest_seconds',
    displayName: 'display_name',
    sex: 'sex',
    birthYear: 'birth_year',
    heightCm: 'height_cm',
    goalWeightKg: 'goal_weight_kg',
    goal: 'goal',
    focusMuscles: 'focus_muscles',
    experience: 'experience',
    daysPerWeek: 'days_per_week',
    sessionMin: 'session_min',
    equipment: 'equipment',
    onboarded: 'onboarded',
  };
  (Object.keys(prefs) as (keyof UserPrefs)[]).forEach((k) => {
    if (prefs[k] !== undefined) row[map[k]] = prefs[k];
  });
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

// Delete a single weigh-in by its row id (RLS scopes it to the current user).
export async function deleteBodyweight(id: string): Promise<void> {
  const { error } = await getSupabase().from('bodyweight_log').delete().eq('id', id);
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
