/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    // never load the real supabase client (pulls a WebSocket dep) in tests
    '^@supabase/supabase-js$': '<rootDir>/src/testUtils/supabaseStub.ts',
  },
};
