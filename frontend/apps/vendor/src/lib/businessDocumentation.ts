export const BUSINESS_TYPES = ['Restaurant', 'Shop', 'Pharmacy', 'Market'] as const;

export type BusinessTypeKey = (typeof BUSINESS_TYPES)[number];

export const DOCUMENTATION_PAGE_SUBTITLE = 'Register to get your business onboard';

export const DOCUMENTATION_SECTION_DESCRIPTION =
  'Used to verify your business and keep the platform trusted.';

export interface DocumentFieldConfig {
  id: string;
  label: string;
  required?: boolean;
}

export interface BusinessDocumentationConfig {
  sectionTitle: string;
  sectionDescription: string;
  documents: DocumentFieldConfig[];
}

const SHOP_MARKET_DOCUMENTATION: BusinessDocumentationConfig = {
  sectionTitle: 'Shops',
  sectionDescription: DOCUMENTATION_SECTION_DESCRIPTION,
  documents: [
    { id: 'business_permit', label: 'Business Permit' },
    { id: 'id', label: 'ID', required: true },
  ],
};

export const BUSINESS_DOCUMENTATION: Record<BusinessTypeKey, BusinessDocumentationConfig> = {
  Restaurant: {
    sectionTitle: 'Restaurants',
    sectionDescription: DOCUMENTATION_SECTION_DESCRIPTION,
    documents: [
      { id: 'cac_registration', label: 'Business Registration (C.A.C)' },
      { id: 'owner_manager_id', label: 'ID of Owner/Manager', required: true },
      { id: 'food_handling_permit', label: 'Food Handling Permit' },
    ],
  },
  Shop: SHOP_MARKET_DOCUMENTATION,
  Market: SHOP_MARKET_DOCUMENTATION,
  Pharmacy: {
    sectionTitle: 'Pharmacies',
    sectionDescription: DOCUMENTATION_SECTION_DESCRIPTION,
    documents: [
      { id: 'pharmacist_license', label: 'Pharmacist License', required: true },
      { id: 'pharmacy_premises_license', label: 'Pharmacy Premises License' },
      {
        id: 'superintendent_pharmacist_details',
        label: 'Superintendent Pharmacist Details',
      },
    ],
  },
};

export function normalizeBusinessType(value: string | null | undefined): BusinessTypeKey {
  const match = BUSINESS_TYPES.find((type) => type.toLowerCase() === value?.trim().toLowerCase());
  return match ?? 'Restaurant';
}

/** Cached so catalog setup does not flash “Menu Setup” before the real type loads. */
export const VENDOR_BUSINESS_TYPE_KEY = 'vendor_business_type';

export function getCachedBusinessType(): BusinessTypeKey | null {
  const raw = sessionStorage.getItem(VENDOR_BUSINESS_TYPE_KEY);
  if (!raw) {
    return null;
  }
  return normalizeBusinessType(raw);
}

export function setCachedBusinessType(value: string | null | undefined): BusinessTypeKey {
  const type = normalizeBusinessType(value);
  sessionStorage.setItem(VENDOR_BUSINESS_TYPE_KEY, type);
  return type;
}

export function getDocumentationConfig(businessType: string | null | undefined): BusinessDocumentationConfig {
  return BUSINESS_DOCUMENTATION[normalizeBusinessType(businessType)];
}
