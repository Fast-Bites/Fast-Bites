import { useCallback, useMemo, useState } from 'react';
import {
  RegistrationSectionHeader,
  RegistrationStepFooter,
} from '@/components/RegistrationHeader';
import UploadField from '@/components/UploadField';
import {
  getDocumentationConfig,
  type BusinessTypeKey,
  type DocumentFieldConfig,
} from '@/lib/businessDocumentation';
import { vendorApi } from '@/lib/api';

const DOCUMENT_ACCEPT = 'image/*,application/pdf';

interface DocumentUploadState {
  url: string | null;
  uploading: boolean;
  error: string | null;
}

function createInitialUploadState(documents: DocumentFieldConfig[]): Record<string, DocumentUploadState> {
  return Object.fromEntries(
    documents.map((doc) => [doc.id, { url: null, uploading: false, error: null }]),
  );
}

interface BusinessDocumentationFormProps {
  businessType: BusinessTypeKey;
  onSubmitSuccess?: () => void;
}

export default function BusinessDocumentationForm({
  businessType,
  onSubmitSuccess,
}: BusinessDocumentationFormProps) {
  const config = getDocumentationConfig(businessType);
  const [uploads, setUploads] = useState<Record<string, DocumentUploadState>>(() =>
    createInitialUploadState(config.documents),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isUploading = useMemo(
    () => Object.values(uploads).some((entry) => entry.uploading),
    [uploads],
  );

  const requiredComplete = useMemo(
    () =>
      config.documents
        .filter((doc) => doc.required)
        .every((doc) => Boolean(uploads[doc.id]?.url)),
    [config.documents, uploads],
  );

  const canProceed = requiredComplete && !isUploading && !submitting;

  const handleFileSelect = useCallback(async (documentId: string, file: File | null) => {
    if (!file) {
      return;
    }

    setUploads((current) => ({
      ...current,
      [documentId]: { ...current[documentId], uploading: true, error: null },
    }));

    const result = await vendorApi.uploadVerificationDocument(file, documentId);

    setUploads((current) => {
      if (result.error) {
        return {
          ...current,
          [documentId]: { url: null, uploading: false, error: result.error },
        };
      }

      return {
        ...current,
        [documentId]: { url: result.data?.url ?? null, uploading: false, error: null },
      };
    });
  }, []);

  const handleSubmit = async () => {
    if (!canProceed) {
      return;
    }

    setSubmitError(null);

    const documents = Object.fromEntries(
      config.documents
        .map((doc) => [doc.id, uploads[doc.id]?.url])
        .filter((entry): entry is [string, string] => Boolean(entry[1])),
    );

    setSubmitting(true);
    const result = await vendorApi.submitVerificationDocuments(documents);
    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    onSubmitSuccess?.();
  };

  return (
    <>
      <RegistrationSectionHeader title={config.sectionTitle} description={config.sectionDescription} />

      <section className="space-y-6 [color-scheme:light]">
        {config.documents.map((doc) => (
          <UploadField
            key={doc.id}
            label={doc.label}
            required={doc.required}
            accept={DOCUMENT_ACCEPT}
            previewUrl={uploads[doc.id]?.url}
            uploading={uploads[doc.id]?.uploading}
            error={uploads[doc.id]?.error}
            onFileSelect={(file) => void handleFileSelect(doc.id, file)}
          />
        ))}
      </section>

      {submitError ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <RegistrationStepFooter
        onNext={() => void handleSubmit()}
        label={submitting ? 'Submitting…' : 'Next'}
        disabled={!canProceed}
      />
    </>
  );
}
