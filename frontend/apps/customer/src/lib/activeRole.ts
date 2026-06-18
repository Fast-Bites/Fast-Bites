export const CUSTOMER_ROLE = 'customer';
export const RIDER_ROLE = 'rider';
export const RESTAURANT_ROLE = 'restaurant';

export const VALID_ROLES = [CUSTOMER_ROLE, RIDER_ROLE, RESTAURANT_ROLE] as const;
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

export function isValidRole(role: string | null | undefined): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

export function isCustomerRole(role: string | null | undefined): boolean {
  return role === CUSTOMER_ROLE;
}

export function isRiderRole(role: string | null | undefined): boolean {
  return role === RIDER_ROLE;
}

export function isRestaurantRole(role: string | null | undefined): boolean {
  return role === RESTAURANT_ROLE;
}

export function roleLabel(role: string): string {
  if (isRestaurantRole(role)) return 'restaurant';
  if (isRiderRole(role)) return 'rider';
  return 'customer';
}

export function roleNotFoundMessage(): string {
  return 'No account found with this email.';
}

/** Profile role for customer-app API calls (customer or rider onboarding). */
export function resolveCustomerProfileRole(explicit?: string | null): string {
  if (explicit && isValidRole(explicit) && !isRestaurantRole(explicit)) {
    return explicit;
  }

  const active = getActiveRole();
  if (active && isValidRole(active) && !isRestaurantRole(active)) {
    return active;
  }

  const selected = getSelectedRole();
  if (selected && isValidRole(selected) && !isRestaurantRole(selected)) {
    return selected;
  }

  return CUSTOMER_ROLE;
}
