import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import { AuthGate } from '../auth/AuthGate';

const getSession = vi.fn();
const onAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }));

vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return {
    ...actual,
    getSupabase: () => ({
      auth: {
        getSession,
        onAuthStateChange,
        signOut: vi.fn(),
      },
    }),
  };
});

describe('AuthGate', () => {
  it('shows the sign-in form when there is no session', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    render(
      <AuthProvider>
        <AuthGate>
          <div>Protected content</div>
        </AuthGate>
      </AuthProvider>
    );

    expect(await screen.findByText('Welcome Back')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders the app once a session exists', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
    render(
      <AuthProvider>
        <AuthGate>
          <div>Protected content</div>
        </AuthGate>
      </AuthProvider>
    );

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
  });
});
