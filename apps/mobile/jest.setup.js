// Runs before each test file. Force the manual mock of @supabase/supabase-js
// (in __mocks__/) so no test loads the real client's WebSocket dependency.
jest.mock('@supabase/supabase-js');
