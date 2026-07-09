import { api, auth } from './api';
import {
  RESTAURANT_ROLE,
  clearSelectedRole,
  getSelectedRole,
  isRestaurantRole,
  setActiveRole,
  setSelectedRole,
} from './activeRole';

/** Where unauthenticated vendor users pick sign-up / sign-in (customer app). */
export function redirectToCustomerRestaurantSignIn(): void {
  setSelectedRole(RESTAURANT_ROLE);
  window.location.assign('/signup');
}

/** Build a vendor-portal URL on the same origin so Supabase session is preserved in dev. */
export function getVendorPortalUrl(path = '/verify-business'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${window.location.origin}/vendor${normalizedPath}`;
}

/** Send restaurant users to the vendor portal after customer auth flows. */
export function redirectRestaurantToVendorPortal(): void {
  setActiveRole(RESTAURANT_ROLE);
  clearSelectedRole();
  window.location.assign(getVendorPortalUrl('/'));
}

export { getSelectedRole, isRestaurantRole } from './activeRole';

function stubNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim();
  return local || 'Restaurant';
}

/**
 * Ensures a restaurant role profile exists, then sends the user to vendor verification.
 */
export async function finalizeRestaurantAuth(): Promise<{ ok: boolean; error?: string }> {
  const selectedRole = getSelectedRole();
  if (!isRestaurantRole(selectedRole)) {
    return { ok: false, error: 'Restaurant role not selected.' };
  }

  const { data: user } = await auth.getUser();
  if (user && !user.email_confirmed_at) {
    if (user.email) {
      sessionStorage.setItem('signup_email', user.email);
    }
    return { ok: false, error: 'Please verify your email before continuing.' };
  }

  const { data: profile, error: profileError } = await api.getProfile(RESTAURANT_ROLE);

  if (!profileError && profile?.role === RESTAURANT_ROLE) {
    sessionStorage.removeItem('signup_email');
    clearSelectedRole();
    redirectRestaurantToVendorPortal();
    return { ok: true };
  }

  const email = sessionStorage.getItem('signup_email') || '';
  const { error: createError } = await api.createProfile({
    first_name: stubNameFromEmail(email),
    last_name: 'Business',
    role: RESTAURANT_ROLE,
  });

  if (createError) {
    if (createError.toLowerCase().includes('already exists')) {
      sessionStorage.removeItem('signup_email');
      clearSelectedRole();
      redirectRestaurantToVendorPortal();
      return { ok: true };
    }
    return { ok: false, error: createError };
  }

  sessionStorage.removeItem('signup_email');
  clearSelectedRole();
  redirectRestaurantToVendorPortal();
  return { ok: true };
}

export function restaurantSignupRedirectUrl(): string {
  return `${window.location.origin}/restaurant-auth-complete`;
}

export function customerSignupRedirectUrl(): string {
  return `${window.location.origin}/signup-form-2`;
}

export function signupRedirectUrlForRole(role: string | null | undefined): string {
  return isRestaurantRole(role) ? restaurantSignupRedirectUrl() : customerSignupRedirectUrl();
}
