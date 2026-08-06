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
  | '/verify-business/documentation'
  | '/verify-business/catalog';

export function isBusinessVerified(profile: VendorProfile | null | undefined): boolean {
  return profile?.business_verified === true || profile?.verification_stage === 'verified';
}

function pathAfterDocumentation(registration?: BusinessRegistrationSummary | null): VendorPortalPath {
  if (registration?.catalog_setup_completed) {
    return '/dashboard';
  }
  return '/verify-business/catalog';
}

function documentationStepComplete(registration?: BusinessRegistrationSummary | null): boolean {
  return Boolean(
    registration?.documents_submitted || registration?.documentation_skipped,
  );
}

export function vendorVerificationPath(
  profile: VendorProfile | null | undefined,
  registration?: BusinessRegistrationSummary | null,
): VendorPortalPath {
  if (isBusinessVerified(profile)) {
    return pathAfterDocumentation(registration);
  }

  const stage = profile?.verification_stage ?? registration?.verification_stage;

  if (stage === 'pending_review') {
    return pathAfterDocumentation(registration);
  }

  if (stage === 'documentation') {
    if (documentationStepComplete(registration)) {
      return pathAfterDocumentation(registration);
    }
    return '/verify-business/documentation';
  }

  if (!stage && documentationStepComplete(registration)) {
    return pathAfterDocumentation(registration);
  }

  if (!stage && registration?.business_type) {
    return '/verify-business/documentation';
  }

  return '/verify-business';
}

export async function resolveVendorPortalPath(
  profile: VendorProfile | null | undefined,
): Promise<VendorPortalPath> {
  const stage = profile?.verification_stage;

  // Always load registration details once business info exists so we know
  // whether docs were submitted/skipped and catalog setup is done.
  if (stage && stage !== 'registration') {
    const registration = await vendorApi.getBusinessRegistration();
    return vendorVerificationPath(profile, registration.data ?? null);
  }

  const registration = await vendorApi.getBusinessRegistration();
  if (registration.data) {
    return vendorVerificationPath(profile, registration.data);
  }

  return vendorVerificationPath(profile);
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
