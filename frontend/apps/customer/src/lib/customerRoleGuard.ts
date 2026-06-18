import { api, auth } from './api';
import {
  CUSTOMER_ROLE,
  getActiveRole,
  getSelectedRole,
  isRestaurantRole,
  isValidRole,
  setActiveRole,
  setSelectedRole,
} from './activeRole';
import { redirectRestaurantToVendorPortal } from './vendorRedirect';

export type CustomerGuardResult =
  | { status: 'ok' }
  | { status: 'no_session' }
  | { status: 'vendor_portal' }
  | { status: 'needs_customer_signin' };

export type OnboardingGuardResult =
  | { status: 'ok' }
  | { status: 'no_session' }
  | { status: 'vendor_portal' }
  | { status: 'needs_role_selection' };

export async function checkCustomerRouteAccess(): Promise<CustomerGuardResult> {
  const { data: session } = await auth.getSession();
  if (!session) {
    return { status: 'no_session' };
  }

  if (isRestaurantRole(getActiveRole())) {
    return { status: 'vendor_portal' };
  }

  const { data: profile, error } = await api.getProfile(CUSTOMER_ROLE);
  if (profile && !error) {
    if (getActiveRole() !== CUSTOMER_ROLE) {
      setActiveRole(CUSTOMER_ROLE);
    }
    return { status: 'ok' };
  }

  setSelectedRole(CUSTOMER_ROLE);
  return { status: 'needs_customer_signin' };
}

export async function checkOnboardingRouteAccess(): Promise<OnboardingGuardResult> {
  const { data: session } = await auth.getSession();
  if (!session) {
    return { status: 'no_session' };
  }

  if (isRestaurantRole(getActiveRole())) {
    return { status: 'vendor_portal' };
  }

  const selectedRole = getSelectedRole();
  if (selectedRole && isRestaurantRole(selectedRole)) {
    return { status: 'vendor_portal' };
  }

  // After profile creation, selected_role may be cleared but activeRole is set.
  const onboardingRole = selectedRole || getActiveRole();
  if (!onboardingRole || !isValidRole(onboardingRole) || isRestaurantRole(onboardingRole)) {
    return { status: 'needs_role_selection' };
  }

  return { status: 'ok' };
}

export function redirectToVendorPortal(): void {
  redirectRestaurantToVendorPortal();
}
