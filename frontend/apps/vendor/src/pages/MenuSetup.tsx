import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompactUploadZone from '@/components/CompactUploadZone';
import MenuItemRow from '@/components/MenuItemRow';
import MenuSetupOptionList, {
  menuSetupOptionsDividerClassName,
  menuSetupOptionsListWrapClassName,
  menuSetupOptionsRowClassName,
  menuSetupUploadBoxClassName,
  menuSetupUploadColumnClassName,
} from '@/components/MenuSetupOptionList';
import {
  RegistrationBackButton,
  RegistrationPageTitle,
  RegistrationSectionHeader,
  RegistrationSkipButton,
  RegistrationStepFooter,
} from '@/components/RegistrationHeader';
import RegistrationPageShell from '@/components/RegistrationPageShell';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { vendorApi } from '@/lib/api';
import {
  getCachedBusinessType,
  setCachedBusinessType,
  type BusinessTypeKey,
} from '@/lib/businessDocumentation';
import { catalogCopyFor } from '@/lib/catalogCopy';
import {
  MENU_SCAN_ACCEPT,
  MENU_SCAN_ACCEPT_HINT,
  MENU_SETUP_PAGE_SUBTITLE,
  MENU_UPLOAD_ACCEPT,
  MENU_UPLOAD_ACCEPT_HINT,
  createEmptyMenuItem,
  durationToMinutes,
  isMenuImageFile,
  markMenuSetupDone,
  menuFileTypeLabel,
  minutesToDuration,
  parsePriceInput,
  type MenuItemDraft,
  type MenuSetupOptionId,
} from '@/lib/menuSetup';

const SCROLL_TOP_SHOW_AFTER_PX = 120;

export default function MenuSetup() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDocumentationLink, setShowDocumentationLink] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessTypeKey | null>(() =>
    getCachedBusinessType(),
  );
  const [catalogReady, setCatalogReady] = useState(() => Boolean(getCachedBusinessType()));
  const [option, setOption] = useState<MenuSetupOptionId | null>(null);
  const [items, setItems] = useState<MenuItemDraft[]>([
    createEmptyMenuItem(),
    createEmptyMenuItem(),
  ]);
  /** Kept locally for extraction — not uploaded to Cloudinary. */
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<string | null>(null);

  const copy = useMemo(
    () => (businessType ? catalogCopyFor(businessType) : null),
    [businessType],
  );
  const setupOptions = useMemo(
    () =>
      copy
        ? ([
            { id: 'scan' as const, label: copy.scanLabel },
            { id: 'upload' as const, label: copy.uploadLabel },
            { id: 'manual' as const, label: copy.manualLabel },
          ] as const)
        : [],
    [copy],
  );

  const showUploadZone = option === 'scan' || option === 'upload';

  useEffect(() => {
    let cancelled = false;

    const loadCatalogContext = async () => {
      const registration = await vendorApi.getBusinessRegistration();
      if (cancelled) {
        return;
      }

      const rawType = registration.data?.business_type;
      const type = rawType
        ? setCachedBusinessType(rawType)
        : getCachedBusinessType() ?? setCachedBusinessType(null);
      setBusinessType(type);
      setShowDocumentationLink(Boolean(registration.data?.documentation_skipped));
      setCatalogReady(true);
    };

    void loadCatalogContext();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    const onScroll = () => {
      setShowScrollTop(node.scrollTop > SCROLL_TOP_SHOW_AFTER_PX);
    };

    onScroll();
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, [option, catalogReady]);

  const hasSavableItems = useMemo(
    () => items.some((item) => item.name.trim() && parsePriceInput(item.price) != null),
    [items],
  );

  const canProceed = useMemo(() => {
    if (!option || extracting || saving) {
      return false;
    }
    if (showUploadZone) {
      return Boolean(menuFile) && hasSavableItems;
    }
    return hasSavableItems;
  }, [extracting, hasSavableItems, menuFile, option, saving, showUploadZone]);

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
    setSaveError(null);
    setStatusInfo(null);
    setItems([createEmptyMenuItem(), createEmptyMenuItem()]);
  };

  const finishMenuSetup = async () => {
    markMenuSetupDone();
    await vendorApi.completeCatalogSetup();
    navigate('/dashboard', { replace: true });
  };

  const goToDocumentation = () => {
    navigate('/verify-business/documentation-processing');
  };

  const removeItem = (index: number) => {
    setItems((current) => {
      if (current.length <= 1) {
        return [createEmptyMenuItem()];
      }
      return current.filter((_, i) => i !== index);
    });
  };

  const runExtract = async (file: File) => {
    setExtracting(true);
    setUploadError(null);
    setSaveError(null);
    setStatusInfo(`Reading ${file.name}…`);
    const result = await vendorApi.extractCatalogItems(file);
    setExtracting(false);

    if (result.error) {
      setStatusInfo(null);
      setUploadError(
        typeof result.error === 'string' ? result.error : 'Could not read items from file.',
      );
      return;
    }

    const extracted = result.data?.items ?? [];
    if (!extracted.length) {
      setStatusInfo(result.data?.message ?? 'No products found.');
      setUploadError('No products found. Try a clearer image or enter items manually.');
      setItems([createEmptyMenuItem(), createEmptyMenuItem()]);
      return;
    }

    const withModifiers = extracted.filter((row) => (row.modifiers ?? []).some((m) => m.options?.length)).length;
    setStatusInfo(
      result.data?.message ??
        `Found ${extracted.length} item(s)${withModifiers ? `; ${withModifiers} with modifiers.` : '.'}`,
    );
    setItems(
      extracted.map((row) => ({
        ...createEmptyMenuItem(),
        name: row.name,
        price: String(row.price),
        vendorCategory: row.vendor_category?.trim() || '',
        portionSize: row.portion_size?.trim() || '',
        duration: copy?.showDurationField
          ? minutesToDuration(row.delivery_time)
          : '',
        modifiers: (row.modifiers ?? []).filter((m) => m.options?.length),
      })),
    );
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
    void runExtract(file);
  };

  const updateItem = (index: number, next: MenuItemDraft) => {
    setItems((current) => current.map((item, i) => (i === index ? next : item)));
  };

  const handleNext = async () => {
    if (!canProceed || saving) {
      return;
    }

    const payload = items.flatMap((item) => {
      const name = item.name.trim();
      const price = parsePriceInput(item.price);
      if (!name || price == null) {
        return [];
      }
      return [
        {
          name,
          price,
          vendor_category: item.vendorCategory.trim() || null,
          delivery_time: copy?.showDurationField
            ? durationToMinutes(item.duration)
            : null,
          portion_size: copy?.showSizeField
            ? item.portionSize.trim() || null
            : null,
          modifiers: item.modifiers?.length ? item.modifiers : undefined,
        },
      ];
    });

    if (!payload.length) {
      setSaveError('Add at least one item with name and price.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setStatusInfo(`Saving ${payload.length} item(s)…`);
    const result = await vendorApi.createCatalogItems(payload);
    setSaving(false);

    if (result.error) {
      setStatusInfo(null);
      setSaveError(
        typeof result.error === 'string' ? result.error : 'Failed to save catalog items.',
      );
      return;
    }

    setStatusInfo(
      result.data?.message ??
        `Saved ${result.data?.created_count ?? payload.length} item(s).`,
    );
    await finishMenuSetup();
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!catalogReady || !copy) {
    return (
      <RegistrationPageShell fillViewport>
        <div className="relative z-20 mb-4 flex shrink-0 items-center justify-between py-1 max-[500px]:mb-2">
          {showDocumentationLink ? (
            <RegistrationBackButton onClick={goToDocumentation} />
          ) : (
            <span />
          )}
          <RegistrationSkipButton onClick={() => void finishMenuSetup()} />
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-base text-gray-500">Loading…</p>
        </div>
      </RegistrationPageShell>
    );
  }

  const nextLabel = extracting ? 'Reading…' : saving ? 'Saving…' : 'Next';

  return (
    <RegistrationPageShell fillViewport>
      <div className="relative z-20 mb-4 flex shrink-0 items-center justify-between py-1 max-[500px]:mb-2">
        {showDocumentationLink ? (
          <RegistrationBackButton onClick={goToDocumentation} />
        ) : (
          <span />
        )}
        <RegistrationSkipButton onClick={() => void finishMenuSetup()} />
      </div>

      <section className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-gutter:stable]"
        >
          <RegistrationPageTitle
            title={copy.pageTitle}
            subtitle={MENU_SETUP_PAGE_SUBTITLE}
            className="mb-10 max-[500px]:mb-6"
          />

          <RegistrationSectionHeader
            title={copy.sectionTitle}
            description={copy.sectionDescription}
          />

          <div className="mb-6 mt-6 max-[500px]:mb-4 max-[500px]:mt-4">
            <h3 className="text-xl font-semibold text-gray-900 max-[500px]:text-base">
              {copy.uploadOptionsTitle}
            </h3>
            <p className="mt-1 text-base text-gray-600 max-[500px]:text-sm">
              {copy.uploadOptionsDescription}
            </p>

            <div className={menuSetupOptionsRowClassName}>
              <div className={menuSetupOptionsListWrapClassName}>
                <MenuSetupOptionList
                  value={option}
                  options={setupOptions}
                  onChange={handleOptionChange}
                />
              </div>

              <div className={menuSetupUploadColumnClassName}>
                <div className={menuSetupOptionsDividerClassName} aria-hidden />
                {showUploadZone ? (
                  <div className={menuSetupUploadBoxClassName}>
                    <CompactUploadZone
                      key={option}
                      variant={option === 'scan' ? 'scan' : 'upload'}
                      accept={uploadAccept}
                      acceptHint={uploadAcceptHint}
                      capture={option === 'scan' ? 'environment' : undefined}
                      emptyLabel={
                        option === 'scan' ? copy.scanEmptyLabel : copy.uploadEmptyLabel
                      }
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
          </div>

          {extracting ? (
            <p className="mb-4 text-sm text-gray-600">Reading products from your file…</p>
          ) : null}

          {statusInfo && !extracting ? (
            <p className="mb-4 text-sm text-gray-600" role="status">
              {statusInfo}
            </p>
          ) : null}

          {option ? (
            <div className="space-y-8 max-[500px]:space-y-5">
              {items.map((item, index) => (
                <MenuItemRow
                  key={item.id}
                  index={index + 1}
                  item={item}
                  copy={copy}
                  onChange={(next) => updateItem(index, next)}
                  canRemove={items.length > 1}
                  onRemove={() => removeItem(index)}
                />
              ))}
            </div>
          ) : null}

          {saveError ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {saveError}
            </p>
          ) : null}
        </div>

        <div className="relative shrink-0">
          <ScrollToTopButton visible={showScrollTop} onClick={scrollToTop} />
          <RegistrationStepFooter
            sticky
            showDivider={Boolean(option)}
            onNext={() => {
              void handleNext();
            }}
            label={nextLabel}
            disabled={!canProceed}
          />
        </div>
      </section>
    </RegistrationPageShell>
  );
}
