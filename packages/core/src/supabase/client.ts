import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The Supabase auth session needs a storage backend, which differs per platform:
//   - web:    window.localStorage
//   - mobile: @react-native-async-storage/async-storage
// So core exposes a factory; each app injects its own storage adapter.
export interface AuthStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

const SUPABASE_URL = 'https://rpigemrnxlagywzzsxnm.supabase.co';
// Publishable (anon) key — safe on the client; Row-Level Security protects data.
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_J5-8Ks0QAV-l3chD-0wT6Q_Dd0cZ9dq';

let _client: SupabaseClient | null = null;

export function createSupabase(storage: AuthStorage): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: storage as never,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

// Apps call setSupabase(...) once at startup; core logic reads it via getSupabase().
export function setSupabase(client: SupabaseClient): void {
  _client = client;
}

export function getSupabase(): SupabaseClient {
  if (!_client) throw new Error('Supabase not initialised — call setSupabase() at app startup.');
  return _client;
}
