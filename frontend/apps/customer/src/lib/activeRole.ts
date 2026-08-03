export const CUSTOMER_ROLE = 'customer';
export const RIDER_ROLE = 'rider';
export const VENDOR_ROLE = 'vendor';

/** @deprecated Use VENDOR_ROLE — kept for legacy session values during migration */
export const RESTAURANT_ROLE = VENDOR_ROLE;

export const VALID_ROLES = [CUSTOMER_ROLE, RIDER_ROLE, VENDOR_ROLE] as const;
export type UserRole = (typeof VALID_ROLES)[number];

export const ACTIVE_ROLE_KEY = 'fast_bites_active_role';
export const SELECTED_ROLE_KEY = 'selected_role';

export function getActiveRole(): string | null {
  return sessionStorage.getItem(ACTIVE_ROLE_KEY);
}

export function setActiveRole(role: string): void {
  sessionStorage.setItem(ACTIVE_ROLE_KEY, role);
}

export function clearActiveRole(): void {
  sessionStorage.removeItem(ACTIVE_ROLE_KEY);
}

export function getSelectedRole(): string | null {
  return sessionStorage.getItem(SELECTED_ROLE_KEY);
}

export function setSelectedRole(role: string): void {
  sessionStorage.setItem(SELECTED_ROLE_KEY, role);
}

export function clearSelectedRole(): void {
  sessionStorage.removeItem(SELECTED_ROLE_KEY);
}

export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  if (role === 'restaurant') return VENDOR_ROLE;
  return isValidRole(role) ? role : null;
}

export function isValidRole(role: string | null | undefined): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

export function isCustomerRole(role: string | null | undefined): boolean {
  return role === CUSTOMER_ROLE;
}

export function isRiderRole(role: string | null | undefined): boolean {
  return role === RIDER_ROLE;
}

export function isVendorRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === VENDOR_ROLE;
}

/** @deprecated Use isVendorRole */
export const isRestaurantRole = isVendorRole;

export function roleLabel(role: string): string {
  if (isVendorRole(role)) return 'vendor';
  if (isRiderRole(role)) return 'rider';
  return 'customer';
}

export function roleNotFoundMessage(): string {
  return 'No account found with this email.';
}

/** Profile role for customer-app API calls (customer or rider onboarding). */
export function resolveCustomerProfileRole(explicit?: string | null): string {
  if (explicit && isValidRole(explicit) && !isVendorRole(explicit)) {
    return explicit;
  }

  const active = getActiveRole();
  if (active && isValidRole(active) && !isVendorRole(active)) {
    return active;
  }

  const selected = getSelectedRole();
  if (selected && isValidRole(selected) && !isVendorRole(selected)) {
    return selected;
  }

  return CUSTOMER_ROLE;
}
