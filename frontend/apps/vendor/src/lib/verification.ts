import type { BusinessRegistrationSummary, VendorProfile } from './api';
import { vendorApi } from './api';

export type VendorVerificationStage =
  | 'registration'
  | 'documentation'
  | 'pending_review'
  | 'verified';

export type VendorPortalPath =
  | '/dashboard'
  | '/verify-business'
  | '/verify-business/documentation';

export function isBusinessVerified(profile: VendorProfile | null | undefined): boolean {
  return profile?.business_verified === true || profile?.verification_stage === 'verified';
}

export function vendorVerificationPath(
  profile: VendorProfile | null | undefined,
  registration?: BusinessRegistrationSummary | null,
): VendorPortalPath {
  if (isBusinessVerified(profile)) {
    return '/dashboard';
  }

  const stage = profile?.verification_stage ?? registration?.verification_stage;

  if (stage === 'documentation' || stage === 'pending_review') {
    return '/verify-business/documentation';
  }

  if (!stage && registration?.documents_submitted) {
    return '/verify-business/documentation';
  }

  if (!stage && registration?.business_type) {
    return '/verify-business/documentation';
  }

  return '/verify-business';
}

export async function resolveVendorPortalPath(
  profile: VendorProfile | null | undefined,
): Promise<VendorPortalPath> {
  const directPath = vendorVerificationPath(profile);
  if (directPath !== '/verify-business' || profile?.verification_stage) {
    return directPath;
  }

  const registration = await vendorApi.getBusinessRegistration();
  if (registration.data) {
    return vendorVerificationPath(profile, registration.data);
  }

  return '/verify-business';
}

/** @deprecated Use vendorVerificationPath(profile) */
export function vendorPortalPath(profile: VendorProfile | null | undefined): VendorPortalPath {
  return vendorVerificationPath(profile);
}

export function isRegistrationComplete(
  stage: VendorVerificationStage | null | undefined,
): boolean {
  return stage === 'documentation' || stage === 'pending_review' || stage === 'verified';
}
