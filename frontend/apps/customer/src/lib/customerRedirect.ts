import type { NavigateFunction } from 'react-router-dom';
import { api, auth } from './api';
import {
  CUSTOMER_ROLE,
  clearSelectedRole,
  isCustomerRole,
  isRiderRole,
  setActiveRole,
} from './activeRole';

function stubNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim();
  return local || 'User';
}

function routeExistingCustomerProfile(
  profile: { address?: string | null },
  navigate: NavigateFunction,
): void {
  if (profile.address) {
    navigate('/home');
  } else {
    navigate('/location');
  }
}

/**
 * Ensures a customer/rider profile exists for this auth account, then routes
 * to the right step in the customer app (new users → signup-form-2).
 */
export async function finalizeCustomerAuth(
  role: string,
  navigate: NavigateFunction,
): Promise<{ ok: boolean; error?: string }> {
  if (!isCustomerRole(role) && !isRiderRole(role)) {
    return { ok: false, error: 'Invalid role.' };
  }

  const { data: user } = await auth.getUser();
  if (user && !user.email_confirmed_at) {
    if (user.email) {
      sessionStorage.setItem('signup_email', user.email);
    }
    return { ok: false, error: 'Please verify your email before continuing.' };
  }

  const { data: profile, error: profileError } = await api.getProfile(role);

  if (profile && !profileError) {
    sessionStorage.removeItem('signup_email');
    setActiveRole(role);
    clearSelectedRole();
    routeExistingCustomerProfile(profile, navigate);
    return { ok: true };
  }

  const email = sessionStorage.getItem('signup_email') || user?.email || '';
  const { error: createError } = await api.createProfile({
    first_name: stubNameFromEmail(email),
    last_name: 'User',
    role,
  });

  if (createError && !createError.toLowerCase().includes('already exists')) {
    return { ok: false, error: createError };
  }

  sessionStorage.removeItem('signup_email');
  setActiveRole(role);
  clearSelectedRole();
  navigate('/signup-form-2');
  return { ok: true };
}

export { CUSTOMER_ROLE };
