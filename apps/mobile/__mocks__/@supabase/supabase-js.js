// Global manual mock for @supabase/supabase-js so tests never load the real
// client (which pulls in a WebSocket dependency that isn't present in CI/node).
// Individual tests still override ../supabase with their own jest.mock factories.
module.exports = {
  createClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ data: {}, error: null }),
      signUp: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'mock' }, error: null }) }) }),
    }),
  }),
};
