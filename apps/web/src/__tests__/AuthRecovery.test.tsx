import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import { AuthGate } from '../auth/AuthGate';
import { friendlyAuthError } from '../auth/authErrors';

const getSession = vi.fn();
let authCallback: ((event: string, session: unknown) => void) | null = null;
const onAuthStateChange = vi.fn((cb: (event: string, session: unknown) => void) => {
  authCallback = cb;
  return { data: { subscription: { unsubscribe: vi.fn() } } };
});

vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return {
    ...actual,
    getSupabase: () => ({
      auth: {
        getSession,
        onAuthStateChange,
        signOut: vi.fn(),
        updateUser: vi.fn(),
      },
    }),
  };
});

describe('friendlyAuthError', () => {
  it('maps invalid credentials', () => {
    expect(friendlyAuthError(new Error('Invalid login credentials'))).toMatch(/incorrect email or password/i);
  });
  it('maps already-registered', () => {
    expect(friendlyAuthError(new Error('User already registered'))).toMatch(/already exists/i);
  });
  it('falls back to the raw message', () => {
    expect(friendlyAuthError(new Error('Some novel error'))).toBe('Some novel error');
  });
});

describe('Password recovery gate', () => {
  beforeEach(() => {
    authCallback = null;
    window.history.replaceState(null, '', '/');
  });

  it('shows the set-a-new-password form when PASSWORD_RECOVERY fires', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
    render(
      <AuthProvider>
        <AuthGate>
          <div>Protected content</div>
        </AuthGate>
      </AuthProvider>
    );
    // Even with a session, a recovery event routes to the reset form.
    authCallback?.('PASSWORD_RECOVERY', { user: { id: 'u1' } });
    expect(await screen.findByText('Set a new password')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
