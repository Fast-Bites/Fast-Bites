import type { NavigateFunction } from 'react-router-dom';
import { auth, api } from './api';
import {
  roleNotFoundMessage,
  setActiveRole,
} from './activeRole';
import {
  finalizeRestaurantAuth,
  isRestaurantRole,
  redirectRestaurantToVendorPortal,
} from './vendorRedirect';

export type RoleAuthResult =
  | { status: 'ok' }
  | { status: 'verify_email'; email?: string }
  | { status: 'role_not_found'; message: string }
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

    if (isRestaurantRole(role)) {
      redirectRestaurantToVendorPortal();
      return { status: 'ok' };
    }

    if (profile.address) {
      navigate('/home');
    } else {
      navigate('/location');
    }
    return { status: 'ok' };
  }

  const { data: rolesPayload } = await api.getRoles();
  const roles = rolesPayload?.roles ?? [];

  if (roles.length === 0) {
    if (isRestaurantRole(role)) {
      const result = await finalizeRestaurantAuth();
      if (!result.ok) {
        return { status: 'error', message: result.error || 'Could not register your restaurant.' };
      }
      return { status: 'ok' };
    }
    navigate('/signup-form-2');
    return { status: 'complete_signup' };
  }

  if (roles.includes(role)) {
    return { status: 'error', message: 'Could not load your profile. Please try again.' };
  }

  return {
    status: 'role_not_found',
    message: roleNotFoundMessage(),
  };
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
    case 'role_not_found':
      setters.setError(result.message);
      setters.setShowRegisterLink(true);
      return;
    case 'error':
      setters.setError(result.message);
      return;
  }
}
