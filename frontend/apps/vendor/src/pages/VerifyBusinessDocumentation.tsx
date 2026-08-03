import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BusinessDocumentationForm from '@/components/BusinessDocumentationForm';
import FullScreenLogoLoader from '@/components/FullScreenLogoLoader';
import {
  RegistrationPageTitle,
  RegistrationSkipButton,
} from '@/components/RegistrationHeader';
import RegistrationPageShell from '@/components/RegistrationPageShell';
import {
  DOCUMENTATION_PAGE_SUBTITLE,
  normalizeBusinessType,
  type BusinessTypeKey,
} from '@/lib/businessDocumentation';
import { vendorApi, vendorAuth } from '@/lib/api';
import { isDocumentationSkipped, isMenuSetupDone, markDocumentationSkipped } from '@/lib/menuSetup';
import { resolveVendorPortalPath } from '@/lib/verification';

interface DocumentationLocationState {
  businessType?: string;
}

export default function VerifyBusinessDocumentation() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as DocumentationLocationState | null;

  const [businessType, setBusinessType] = useState<BusinessTypeKey | null>(
    locationState?.businessType ? normalizeBusinessType(locationState.businessType) : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  // Skip logo loader when we already have business type from a transition screen.
  const [loading, setLoading] = useState(!locationState?.businessType);

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      const { data: profile } = await vendorAuth.getProfile();
      if (cancelled) {
        return;
      }

      if (!profile) {
        setLoadError('Could not load your profile.');
        setLoading(false);
        return;
      }

      const path = await resolveVendorPortalPath(profile);
      if (path === '/verify-business') {
        navigate('/verify-business', { replace: true });
        return;
      }

      if (path === '/dashboard') {
        navigate('/dashboard', { replace: true });
        return;
      }

      if (path === '/verify-business/menu') {
        navigate('/verify-business/menu', { replace: true });
        return;
      }

      // Arriving from the “Going back to Documentation” transition — UI is ready.
      if (locationState?.businessType) {
        setBusinessType(normalizeBusinessType(locationState.businessType));
        setLoading(false);
        return;
      }

      const result = await vendorApi.getBusinessRegistration();
      if (cancelled) {
        return;
      }

      if (result.error || !result.data) {
        setLoadError(result.error ?? 'Could not load your business details.');
        setLoading(false);
        return;
      }

      setBusinessType(normalizeBusinessType(result.data.business_type));

      // Docs submitted or skipped, menu still outstanding → continue to menu.
      if (
        (result.data.documents_submitted || isDocumentationSkipped()) &&
        !isMenuSetupDone()
      ) {
        navigate('/verify-business/menu', { replace: true });
        return;
      }

      setLoading(false);
    };

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [locationState?.businessType, navigate]);

  const goToMenuSetup = (skipped = false) => {
    if (skipped) {
      markDocumentationSkipped();
    }
    navigate('/verify-business/menu-processing', { replace: true });
  };

  if (loading) {
    return <FullScreenLogoLoader />;
  }

  if (loadError || !businessType) {
    return (
      <RegistrationPageShell>
        <p className="text-center text-base text-red-600" role="alert">
          {loadError ?? 'Business type not found. Complete registration first.'}
        </p>
      </RegistrationPageShell>
    );
  }

  return (
    <RegistrationPageShell>
      <div className="mb-4 flex justify-end">
        <RegistrationSkipButton onClick={() => goToMenuSetup(true)} />
      </div>

      <RegistrationPageTitle
        title="Documentation"
        subtitle={DOCUMENTATION_PAGE_SUBTITLE}
        className="mb-10"
      />

      <section className="flex min-h-0 flex-1 flex-col">
        <BusinessDocumentationForm
          businessType={businessType}
          onSubmitSuccess={() => goToMenuSetup(false)}
        />
      </section>
    </RegistrationPageShell>
  );
}
