import type { VendorProfile } from './api';

/** Business verification API is not live yet — treat everyone as unverified until backend sets this. */
export function isBusinessVerified(profile: VendorProfile | null | undefined): boolean {
  return profile?.business_verified === true;
}

export function vendorPortalPath(profile: VendorProfile | null | undefined): '/dashboard' | '/verify-business' {
  return isBusinessVerified(profile) ? '/dashboard' : '/verify-business';
}
