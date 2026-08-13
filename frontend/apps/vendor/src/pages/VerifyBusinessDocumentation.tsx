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
  setCachedBusinessType,
  type BusinessTypeKey,
} from '@/lib/businessDocumentation';
import { vendorApi, vendorAuth } from '@/lib/api';
import { markDocumentationSkipped } from '@/lib/menuSetup';
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

      if (path === '/verify-business/catalog') {
        navigate('/verify-business/catalog', { replace: true });
        return;
      }

      // Arriving from the “Going back to Documentation” transition — UI is ready.
      if (locationState?.businessType) {
        setBusinessType(setCachedBusinessType(locationState.businessType));
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

      setBusinessType(setCachedBusinessType(result.data.business_type));

      // Docs submitted or skipped, catalog still outstanding → continue setup.
      if (
        (result.data.documents_submitted || result.data.documentation_skipped) &&
        !result.data.catalog_setup_completed
      ) {
        navigate('/verify-business/catalog', { replace: true });
        return;
      }

      setLoading(false);
    };

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [locationState?.businessType, navigate]);

  const goToMenuSetup = async (skipped = false) => {
    if (skipped) {
      markDocumentationSkipped();
      setLoadError(null);
      setLoading(true);
      const result = await vendorApi.skipDocumentation();
      if (result.error) {
        setLoading(false);
        setLoadError(
          typeof result.error === 'string'
            ? result.error
            : 'Could not save documentation skip. Try again.',
        );
        return;
      }
    }
    navigate('/verify-business/catalog-processing', { replace: true });
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
    <RegistrationPageShell fillViewport>
      <div className="mb-4 flex shrink-0 justify-end">
        <RegistrationSkipButton onClick={() => void goToMenuSetup(true)} />
      </div>

      <RegistrationPageTitle
        title="Documentation"
        subtitle={DOCUMENTATION_PAGE_SUBTITLE}
        className="mb-6 shrink-0 max-[500px]:mb-4"
      />

      <BusinessDocumentationForm
        businessType={businessType}
        onSubmitSuccess={() => void goToMenuSetup(false)}
      />
    </RegistrationPageShell>
  );
}
