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
  /** Restaurant: portion; Shop/Market/Pharmacy: pack size. */
  showSizeField: boolean;
  sizeFieldLabel: string;
  sizeFieldPlaceholder: string;
  sizeOptions: readonly string[];
  /** Prep / delivery estimate — restaurant only for now. */
  showDurationField: boolean;
  durationFieldLabel: string;
};

const RESTAURANT_SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'Regular'] as const;
const SHOP_SIZE_OPTIONS = ['Single', 'Pack', 'Dozen', 'Carton'] as const;
const PHARMACY_SIZE_OPTIONS = ['Strip', 'Sachet', 'Bottle', 'Box'] as const;
const MARKET_SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'Heap', 'Bag'] as const;

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
    showSizeField: true,
    sizeFieldLabel: 'Portion size',
    sizeFieldPlaceholder: 'Select size',
    sizeOptions: RESTAURANT_SIZE_OPTIONS,
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
    showSizeField: true,
    sizeFieldLabel: 'Pack size',
    sizeFieldPlaceholder: 'Select pack',
    sizeOptions: PHARMACY_SIZE_OPTIONS,
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
    showSizeField: true,
    sizeFieldLabel: 'Pack size',
    sizeFieldPlaceholder: 'Select pack',
    sizeOptions: SHOP_SIZE_OPTIONS,
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
    showSizeField: true,
    sizeFieldLabel: 'Pack size',
    sizeFieldPlaceholder: 'Select pack',
    sizeOptions: MARKET_SIZE_OPTIONS,
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
