import type { NavigateFunction } from 'react-router-dom';
import { auth, api } from './api';
import {
  isCustomerRole,
  isRiderRole,
  isVendorRole,
  setActiveRole,
} from './activeRole';
import { finalizeCustomerAuth } from './customerRedirect';
import {
  finalizeVendorAuth,
  redirectVendorToPortal,
} from './vendorRedirect';

export type RoleAuthResult =
  | { status: 'ok' }
  | { status: 'verify_email'; email?: string }
  | { status: 'complete_signup' }
  | { status: 'error'; message: string };

export async function isEmailVerified(): Promise<boolean> {
  const { data: user } = await auth.getUser();
  return Boolean(user?.email_confirmed_at);
}

export async function continueWithRole(
  role: string,
  navigate: NavigateFunction,
): Promise<RoleAuthResult> {
  const verified = await isEmailVerified();
  if (!verified) {
    const { data: user } = await auth.getUser();
    if (user?.email) {
      sessionStorage.setItem('signup_email', user.email);
    }
    return { status: 'verify_email', email: user?.email };
  }

  const { data: profile, error: profileError } = await api.getProfile(role);

  if (profile && !profileError) {
    setActiveRole(role);

    if (isVendorRole(role)) {
      redirectVendorToPortal();
      return { status: 'ok' };
    }

    if (profile.address) {
      navigate('/home');
    } else {
      navigate('/location');
    }
    return { status: 'ok' };
  }

  if (isVendorRole(role)) {
    const result = await finalizeVendorAuth(role);
    if (!result.ok) {
      return { status: 'error', message: result.error || 'Could not continue. Please try again.' };
    }
    return { status: 'ok' };
  }

  if (isCustomerRole(role) || isRiderRole(role)) {
    const result = await finalizeCustomerAuth(role, navigate);
    if (!result.ok) {
      return { status: 'error', message: result.error || 'Could not continue. Please try again.' };
    }
    return { status: 'ok' };
  }

  navigate('/signup-form-2');
  return { status: 'complete_signup' };
}

export function applyRoleAuthResult(
  result: RoleAuthResult,
  setters: {
    setError: (msg: string) => void;
    setShowVerifyLink: (v: boolean) => void;
    setShowRegisterLink: (v: boolean) => void;
  },
): void {
  switch (result.status) {
    case 'ok':
    case 'complete_signup':
      return;
    case 'verify_email':
      setters.setError('Please verify your email before continuing.');
      setters.setShowVerifyLink(true);
      return;
    case 'error':
      setters.setError(result.message);
      return;
  }
}
