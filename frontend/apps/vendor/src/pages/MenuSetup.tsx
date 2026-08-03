import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompactUploadZone from '@/components/CompactUploadZone';
import MenuItemRow from '@/components/MenuItemRow';
import MenuSetupOptionList, {
  menuSetupOptionsDividerClassName,
  menuSetupUploadBoxClassName,
  menuSetupUploadColumnClassName,
} from '@/components/MenuSetupOptionList';
import {
  RegistrationBackButton,
  RegistrationPageTitle,
  RegistrationSectionHeader,
  RegistrationSkipButton,
  RegistrationStepFooter,
  RegistrationTextLink,
} from '@/components/RegistrationHeader';
import RegistrationPageShell from '@/components/RegistrationPageShell';
import {
  MENU_SCAN_ACCEPT,
  MENU_SCAN_ACCEPT_HINT,
  MENU_SECTION_DESCRIPTION,
  MENU_SECTION_TITLE,
  MENU_SETUP_PAGE_SUBTITLE,
  MENU_UPLOAD_ACCEPT,
  MENU_UPLOAD_ACCEPT_HINT,
  UPLOAD_OPTIONS_DESCRIPTION,
  UPLOAD_OPTIONS_TITLE,
  createEmptyMenuItem,
  isDocumentationSkipped,
  isMenuImageFile,
  markMenuSetupDone,
  menuFileTypeLabel,
  type MenuItemDraft,
  type MenuSetupOptionId,
} from '@/lib/menuSetup';

export default function MenuSetup() {
  const navigate = useNavigate();
  const showDocumentationLink = isDocumentationSkipped();
  const [option, setOption] = useState<MenuSetupOptionId | null>(null);
  const [items, setItems] = useState<MenuItemDraft[]>([
    createEmptyMenuItem(),
    createEmptyMenuItem(),
  ]);
  /** Kept locally for extraction — not uploaded to Cloudinary. */
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const showUploadZone = option === 'scan' || option === 'upload';

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const canProceed = useMemo(() => {
    if (!option) {
      return false;
    }
    if (showUploadZone) {
      return Boolean(menuFile);
    }
    return items.some((item) => item.name.trim() && item.price.trim());
  }, [items, menuFile, option, showUploadZone]);

  const uploadAccept = useMemo(
    () => (option === 'upload' ? MENU_UPLOAD_ACCEPT : MENU_SCAN_ACCEPT),
    [option],
  );

  const uploadAcceptHint = useMemo(
    () => (option === 'upload' ? MENU_UPLOAD_ACCEPT_HINT : MENU_SCAN_ACCEPT_HINT),
    [option],
  );

  const clearMenuFile = () => {
    setMenuFile(null);
    setImagePreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setUploadError(null);
  };

  const handleOptionChange = (next: MenuSetupOptionId) => {
    setOption(next);
    clearMenuFile();
  };

  const finishMenuSetup = () => {
    markMenuSetupDone();
    navigate('/dashboard', { replace: true });
  };

  const goToDocumentation = () => {
    navigate('/verify-business/documentation-processing');
  };

  const handleUpload = (file: File | null) => {
    if (!file) {
      return;
    }

    setUploadError(null);
    setImagePreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return isMenuImageFile(file) ? URL.createObjectURL(file) : null;
    });
    setMenuFile(file);
  };

  const updateItem = (index: number, next: MenuItemDraft) => {
    setItems((current) => current.map((item, i) => (i === index ? next : item)));
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }
    finishMenuSetup();
  };

  return (
    <RegistrationPageShell fillViewport>
      <div className="mb-4 flex shrink-0 items-center justify-between">
        {showDocumentationLink ? (
          <RegistrationBackButton onClick={goToDocumentation} />
        ) : (
          <span />
        )}
        <RegistrationSkipButton onClick={finishMenuSetup} />
      </div>

      <RegistrationPageTitle
        title="Menu Setup"
        subtitle={MENU_SETUP_PAGE_SUBTITLE}
        className="mb-10 shrink-0"
      />

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-gutter:stable]">
          <RegistrationSectionHeader
            title={MENU_SECTION_TITLE}
            description={MENU_SECTION_DESCRIPTION}
          />

          <div className="mb-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-900">{UPLOAD_OPTIONS_TITLE}</h3>
            <p className="mt-1 text-base text-gray-600">{UPLOAD_OPTIONS_DESCRIPTION}</p>

            <div className="my-6 flex items-center gap-0">
              <div className="my-2 w-[42%] shrink-0 sm:w-48">
                <MenuSetupOptionList value={option} onChange={handleOptionChange} />
              </div>

              <div className={menuSetupUploadColumnClassName}>
                <div className={menuSetupOptionsDividerClassName} aria-hidden />
                {showUploadZone ? (
                  <div className={menuSetupUploadBoxClassName}>
                    <CompactUploadZone
                      key={option}
                      accept={uploadAccept}
                      acceptHint={uploadAcceptHint}
                      capture={option === 'scan' ? 'environment' : undefined}
                      emptyLabel={option === 'scan' ? 'Click to scan' : 'Click to upload'}
                      previewUrl={imagePreviewUrl}
                      fileName={imagePreviewUrl ? null : menuFile?.name}
                      fileTypeLabel={
                        imagePreviewUrl || !menuFile ? null : menuFileTypeLabel(menuFile)
                      }
                      error={uploadError}
                      onFileSelect={handleUpload}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <hr className="mt-1 mb-1 border-gray-400" />

            <div className="flex justify-end">
              <RegistrationTextLink disabled={!option}>See full list</RegistrationTextLink>
            </div>
          </div>

          {option ? (
            <div className="space-y-8">
              {items.map((item, index) => (
                <MenuItemRow
                  key={item.id}
                  index={index + 1}
                  item={item}
                  onChange={(next) => updateItem(index, next)}
                />
              ))}
            </div>
          ) : null}

          {uploadError && !showUploadZone ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>

        <RegistrationStepFooter
          sticky
          showDivider={Boolean(option)}
          onNext={handleNext}
          label="Next"
          disabled={!canProceed}
        />
      </section>
    </RegistrationPageShell>
  );
}
