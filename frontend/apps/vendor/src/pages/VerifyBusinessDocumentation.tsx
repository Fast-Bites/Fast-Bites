import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BusinessDocumentationForm from '@/components/BusinessDocumentationForm';
import FullScreenLogoLoader from '@/components/FullScreenLogoLoader';
import {
  RegistrationPageTitle,
} from '@/components/RegistrationHeader';
import RegistrationPageShell from '@/components/RegistrationPageShell';
import {
  DOCUMENTATION_PAGE_SUBTITLE,
  normalizeBusinessType,
  type BusinessTypeKey,
} from '@/lib/businessDocumentation';
import { vendorApi, vendorAuth } from '@/lib/api';
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
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

      if (profile.verification_stage === 'pending_review') {
        setSubmitted(true);
      }

      if (locationState?.businessType) {
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

      if (result.data.documents_submitted) {
        setSubmitted(true);
      }

      setLoading(false);
    };

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [locationState?.businessType, navigate]);

  if (loading) {
    return <FullScreenLogoLoader />;
  }

  if (submitted) {
    return (
      <RegistrationPageShell>
        <RegistrationPageTitle
          title="Documents submitted"
          subtitle="We're reviewing your documents. You'll be notified once verification is complete."
          className="mb-10"
        />
      </RegistrationPageShell>
    );
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
      <RegistrationPageTitle
        title="Documentation"
        subtitle={DOCUMENTATION_PAGE_SUBTITLE}
        className="mb-10"
      />

      <section className="flex min-h-0 flex-1 flex-col">
        <BusinessDocumentationForm
          businessType={businessType}
          onSubmitSuccess={() => setSubmitted(true)}
        />
      </section>
    </RegistrationPageShell>
  );
}
