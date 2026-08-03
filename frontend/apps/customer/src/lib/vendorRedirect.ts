import { api, auth } from './api';
import {
  VENDOR_ROLE,
  clearSelectedRole,
  getSelectedRole,
  isVendorRole,
  setActiveRole,
  setSelectedRole,
} from './activeRole';

/** Where unauthenticated vendor users pick a role (customer app). */
export function redirectToCustomerVendorSignIn(): void {
  setSelectedRole(VENDOR_ROLE);
  window.location.assign('/role-selection');
}

/** @deprecated Use redirectToCustomerVendorSignIn */
export const redirectToCustomerRestaurantSignIn = redirectToCustomerVendorSignIn;

/** Build a vendor-portal URL on the same origin so Supabase session is preserved in dev. */
export function getVendorPortalUrl(path = '/verify-business'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${window.location.origin}/vendor${normalizedPath}`;
}

/** Send vendor users to the vendor portal after customer auth flows. */
export function redirectVendorToPortal(): void {
  setActiveRole(VENDOR_ROLE);
  clearSelectedRole();
  window.location.assign(getVendorPortalUrl('/'));
}

/** @deprecated Use redirectVendorToPortal */
export const redirectRestaurantToVendorPortal = redirectVendorToPortal;

export { getSelectedRole, isVendorRole, isRestaurantRole } from './activeRole';

function stubNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim();
  return local || 'Vendor';
}

/**
 * Ensures a vendor role profile exists, then sends the user to vendor verification.
 */
export async function finalizeVendorAuth(
  forRole?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const selectedRole = forRole ?? getSelectedRole();
  if (!isVendorRole(selectedRole)) {
    return { ok: false, error: 'Vendor role not selected.' };
  }

  const { data: user } = await auth.getUser();
  if (user && !user.email_confirmed_at) {
    if (user.email) {
      sessionStorage.setItem('signup_email', user.email);
    }
    return { ok: false, error: 'Please verify your email before continuing.' };
  }

  const { data: profile, error: profileError } = await api.getProfile(VENDOR_ROLE);

  if (!profileError && profile && isVendorRole(profile.role)) {
    sessionStorage.removeItem('signup_email');
    clearSelectedRole();
    redirectVendorToPortal();
    return { ok: true };
  }

  const email = sessionStorage.getItem('signup_email') || user?.email || '';
  const { error: createError } = await api.createProfile({
    first_name: stubNameFromEmail(email),
    last_name: 'Business',
    role: VENDOR_ROLE,
  });

  if (createError) {
    if (createError.toLowerCase().includes('already exists')) {
      sessionStorage.removeItem('signup_email');
      clearSelectedRole();
      redirectVendorToPortal();
      return { ok: true };
    }
    return { ok: false, error: createError };
  }

  sessionStorage.removeItem('signup_email');
  clearSelectedRole();
  redirectVendorToPortal();
  return { ok: true };
}

/** @deprecated Use finalizeVendorAuth */
export const finalizeRestaurantAuth = finalizeVendorAuth;

export function vendorSignupRedirectUrl(): string {
  return `${window.location.origin}/vendor-auth-complete`;
}

/** @deprecated Use vendorSignupRedirectUrl */
export const restaurantSignupRedirectUrl = vendorSignupRedirectUrl;

export function customerSignupRedirectUrl(): string {
  return `${window.location.origin}/signup-form-2`;
}

export function signupRedirectUrlForRole(role: string | null | undefined): string {
  return isVendorRole(role) ? vendorSignupRedirectUrl() : customerSignupRedirectUrl();
}
