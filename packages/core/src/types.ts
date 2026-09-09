// Shared TypeScript types for Gym Trainer (React Native + Expo)

export type Kind = 'bar' | 'cable' | 'machine' | 'db' | 'bw';
export type PlanKey = 'gym' | 'cal' | 'travel';

export interface Variation { name: string; img: string; img2: string }

// slots are tuples: [slotName, scheme, force] e.g. ["Flat chest press", "4 × 8–10", ""]
export type Slot = [string, string, string];

export interface Session {
  name: string;
  emoji: string;
  group: 'broad' | 'focused';
  muscles: string;
  slots: Slot[];
}

export interface Plan {
  label: string;
  icon: string;
  sessions: Record<string, Session>;
  variations: Record<string, Partial<Record<Kind, Variation>>>;
  cues: Record<string, string>;
}

export interface Meals {
  targets?: unknown;
  principles?: unknown;
  meals?: unknown;
  protein_foods?: unknown;
}

export interface Catalog {
  plans: Record<PlanKey, Plan>;
  meals: Meals;
}

// ── User data (Supabase-backed) ──────────────────────────────
export interface LoggedSet { w: string; r: string }
export interface LoggedSlot {
  slot: string;
  kind: Kind;
  done: boolean;
  force: boolean;
  sets: LoggedSet[];
}
export interface WorkoutEntry {
  id: string;                 // uuid from Supabase
  clientId?: number;          // original app numeric id (migration/dedupe)
  date: string;               // ISO
  plan: string;
  sess: string;
  name: string;
  type?: 'workout' | 'skate' | 'rest';
  slots: LoggedSlot[];
}

export interface Recommendation {
  date: string;
  type: 'train' | 'rest';
  plan: string;
  session: string;
  sessionName: string;
  emoji: string;
  title: string;
  reason: string;
  exercises: string[];
  stats: Record<string, number>;
}
