// Maps raw Supabase auth error messages to friendly, user-facing copy.
export function friendlyAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const msg = raw.toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (msg.includes('password should be at least') || msg.includes('password is too short')) {
    return 'Password must be at least 6 characters.';
  }
  if (msg.includes('unable to validate email') || msg.includes('invalid email')) {
    return 'That email address doesn’t look right.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }

  return raw || 'Something went wrong. Please try again.';
}
