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
    { id: 'business_permit', label: 'Business Permit', required: true },
    { id: 'id', label: 'ID', required: true },
  ],
};

export const BUSINESS_DOCUMENTATION: Record<BusinessTypeKey, BusinessDocumentationConfig> = {
  Restaurant: {
    sectionTitle: 'Restaurants',
    sectionDescription: DOCUMENTATION_SECTION_DESCRIPTION,
    documents: [
      { id: 'cac_registration', label: 'Business Registration (C.A.C)', required: true },
      { id: 'owner_manager_id', label: 'ID of Owner/Manager', required: true },
      { id: 'food_handling_permit', label: 'Food Handling Permit', required: true },
    ],
  },
  Shop: SHOP_MARKET_DOCUMENTATION,
  Market: SHOP_MARKET_DOCUMENTATION,
  Pharmacy: {
    sectionTitle: 'Pharmacies',
    sectionDescription: DOCUMENTATION_SECTION_DESCRIPTION,
    documents: [
      { id: 'pharmacist_license', label: 'Pharmacist License', required: true },
      { id: 'pharmacy_premises_license', label: 'Pharmacy Premises License', required: true },
      {
        id: 'superintendent_pharmacist_details',
        label: 'Superintendent Pharmacist Details',
        required: true,
      },
    ],
  },
};

export function normalizeBusinessType(value: string | null | undefined): BusinessTypeKey {
  const match = BUSINESS_TYPES.find((type) => type.toLowerCase() === value?.trim().toLowerCase());
  return match ?? 'Restaurant';
}

export function getDocumentationConfig(businessType: string | null | undefined): BusinessDocumentationConfig {
  return BUSINESS_DOCUMENTATION[normalizeBusinessType(businessType)];
}
