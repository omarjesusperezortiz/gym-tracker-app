// Test stub for @supabase/supabase-js so unit tests never load the real client
// (which imports a WebSocket dependency not available in the Node test env).
export function createClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: () => ({}),
  };
}
export type SupabaseClient = ReturnType<typeof createClient>;
