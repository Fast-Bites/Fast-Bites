import type { BusinessTypeKey } from '@/lib/businessDocumentation';

/** Shared product/catalog wording that changes by vendor business type. */
export type CatalogCopy = {
  pageTitle: string;
  sectionTitle: string;
  sectionDescription: string;
  uploadOptionsTitle: string;
  uploadOptionsDescription: string;
  scanLabel: string;
  uploadLabel: string;
  manualLabel: string;
  scanEmptyLabel: string;
  uploadEmptyLabel: string;
  categoryFieldLabel: string;
  vendorCategoryPlaceholder: string;
  /** Prep / delivery estimate — restaurant only for now. */
  showDurationField: boolean;
  durationFieldLabel: string;
};

const BY_TYPE: Record<BusinessTypeKey, CatalogCopy> = {
  Restaurant: {
    pageTitle: 'Menu Setup',
    sectionTitle: 'Menu',
    sectionDescription: 'What customers can order from your restaurant',
    uploadOptionsTitle: 'Upload options',
    uploadOptionsDescription:
      "Choose how you'd like to add your menu. You can always edit it later.",
    scanLabel: 'Scan menu',
    uploadLabel: 'Upload menu file',
    manualLabel: 'Create manually',
    scanEmptyLabel: 'Click to scan',
    uploadEmptyLabel: 'Click to upload',
    categoryFieldLabel: 'Category',
    vendorCategoryPlaceholder: 'e.g. Swallow, Grill',
    showDurationField: true,
    durationFieldLabel: 'Duration',
  },
  Pharmacy: {
    pageTitle: 'Products Setup',
    sectionTitle: 'Products',
    sectionDescription: 'What customers can order from your pharmacy',
    uploadOptionsTitle: 'Upload options',
    uploadOptionsDescription:
      "Choose how you'd like to add your products. You can always edit them later.",
    scanLabel: 'Scan list',
    uploadLabel: 'Upload product file',
    manualLabel: 'Create manually',
    scanEmptyLabel: 'Click to scan',
    uploadEmptyLabel: 'Click to upload',
    categoryFieldLabel: 'Category',
    vendorCategoryPlaceholder: 'e.g. Pain relief, Vitamins',
    showDurationField: false,
    durationFieldLabel: 'Duration',
  },
  Shop: {
    pageTitle: 'Inventory Setup',
    sectionTitle: 'Inventory',
    sectionDescription: 'What customers can order from your shop',
    uploadOptionsTitle: 'Upload options',
    uploadOptionsDescription:
      "Choose how you'd like to add your items. You can always edit them later.",
    scanLabel: 'Scan list',
    uploadLabel: 'Upload inventory file',
    manualLabel: 'Create manually',
    scanEmptyLabel: 'Click to scan',
    uploadEmptyLabel: 'Click to upload',
    categoryFieldLabel: 'Category',
    vendorCategoryPlaceholder: 'e.g. Snacks, Household',
    showDurationField: false,
    durationFieldLabel: 'Duration',
  },
  Market: {
    pageTitle: 'Inventory Setup',
    sectionTitle: 'Inventory',
    sectionDescription: 'What customers can order from your market',
    uploadOptionsTitle: 'Upload options',
    uploadOptionsDescription:
      "Choose how you'd like to add your items. You can always edit them later.",
    scanLabel: 'Scan list',
    uploadLabel: 'Upload inventory file',
    manualLabel: 'Create manually',
    scanEmptyLabel: 'Click to scan',
    uploadEmptyLabel: 'Click to upload',
    categoryFieldLabel: 'Category',
    vendorCategoryPlaceholder: 'e.g. Tomatoes, Grains',
    showDurationField: false,
    durationFieldLabel: 'Duration',
  },
};

export function catalogCopyFor(businessType: BusinessTypeKey | string | null | undefined): CatalogCopy {
  const key = (businessType || 'Restaurant') as BusinessTypeKey;
  return BY_TYPE[key] ?? BY_TYPE.Restaurant;
}

export type PlatformCategory = {
  id: string;
  business_type: string;
  slug: string;
  name: string;
  sort_order: number;
};
