import { getApiUrl } from '@fast-bites/api-client';
import { apiRequest } from '@fast-bites/api-client';
import type { UserRole } from '@fast-bites/shared';
import { supabase } from './supabase';
import { toBusinessRegistrationPayload, type BusinessRegistrationFormData } from './businessRegistration';

export interface VendorProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  business_id?: string | null;
  business_verified?: boolean;
  verification_stage?: 'registration' | 'documentation' | 'pending_review' | 'verified' | null;
}

export interface BusinessRegistrationResult {
  business_id: string;
  business_verified: boolean;
  verification_submitted_at?: string | null;
}

export interface BusinessRegistrationSummary {
  business_id: string;
  business_name: string;
  business_owner?: string | null;
  business_type: string;
  business_verified: boolean;
  verification_stage: 'registration' | 'documentation' | 'pending_review' | 'verified';
  documents_submitted: boolean;
  documentation_skipped?: boolean;
  catalog_setup_completed?: boolean;
}

export interface VendorImageUploadResult {
  url: string;
  public_id: string;
}

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const vendorAuth = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  getProfile: async () => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    return apiRequest<VendorProfile>('/users/profile?role=vendor', { authToken: token });
  },
};

export const vendorApi = {
  getProfile: () => vendorAuth.getProfile(),

  uploadVendorImage: async (
    file: File,
    kind: 'logo' | 'cover' | 'menu' | 'document',
    options?: {
      businessName?: string | null;
      businessId?: string | null;
      menuItemName?: string | null;
      documentKey?: string | null;
    },
  ) => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('file', file);
    if (options?.businessName?.trim()) {
      formData.append('business_name', options.businessName.trim());
    }
    if (options?.businessId?.trim()) {
      formData.append('business_id', options.businessId.trim());
    }
    if (options?.menuItemName?.trim()) {
      formData.append('menu_item_name', options.menuItemName.trim());
    }
    if (options?.documentKey?.trim()) {
      formData.append('document_key', options.documentKey.trim());
    }

    try {
      const response = await fetch(`${getApiUrl()}/vendors/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return { error: (error as { detail?: string }).detail || 'Upload failed' };
      }

      const data = (await response.json()) as VendorImageUploadResult;
      return { data };
    } catch {
      return { error: 'Network error' };
    }
  },

  /** @deprecated Use uploadVendorImage */
  uploadRestaurantImage: async (
    file: File,
    kind: 'logo' | 'cover' | 'menu' | 'document',
    options?: {
      restaurantName?: string | null;
      restaurantId?: string | null;
      menuItemName?: string | null;
      documentKey?: string | null;
    },
  ) =>
    vendorApi.uploadVendorImage(file, kind, {
      businessName: options?.restaurantName,
      businessId: options?.restaurantId,
      menuItemName: options?.menuItemName,
      documentKey: options?.documentKey,
    }),

  uploadVerificationDocument: async (
    file: File,
    documentKey: string,
    options?: { businessName?: string | null; businessId?: string | null },
  ) => {
    return vendorApi.uploadVendorImage(file, 'document', {
      businessName: options?.businessName,
      businessId: options?.businessId,
      documentKey,
    });
  },

  uploadMenuImage: async (
    file: File,
    menuItemName: string,
    options?: { businessName?: string | null; businessId?: string | null },
  ) => {
    return vendorApi.uploadVendorImage(file, 'menu', {
      businessName: options?.businessName,
      businessId: options?.businessId,
      menuItemName,
    });
  },

  getBusinessRegistration: async () => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    return apiRequest<BusinessRegistrationSummary>('/vendors/registration', { authToken: token });
  },

  submitBusinessRegistration: async (data: BusinessRegistrationFormData) => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    return apiRequest<BusinessRegistrationResult>('/vendors/registration', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify(toBusinessRegistrationPayload(data)),
    });
  },

  submitVerificationDocuments: async (documents: Record<string, string>) => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    return apiRequest<BusinessRegistrationResult>('/vendors/verification-documents', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ documents }),
    });
  },

  getPlatformCategories: async (businessType: string) => {
    const type = encodeURIComponent(businessType.trim() || 'Restaurant');
    return apiRequest<
      Array<{
        id: string;
        business_type: string;
        slug: string;
        name: string;
        sort_order: number;
      }>
    >(`/menu/platform-categories?business_type=${type}`);
  },

  extractCatalogItems: async (file: File) => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${getApiUrl()}/vendors/catalog-extract`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return { error: (error as { detail?: string }).detail || 'Extraction failed' };
      }

      const data = (await response.json()) as {
        items: Array<{
          name: string;
          price: number;
          vendor_category?: string | null;
          delivery_time?: number | null;
          modifiers?: Array<{
            group: string;
            options: Array<{ label: string; price_delta: number }>;
          }>;
        }>;
        provider: string;
        item_count?: number;
        modifiers_count?: number;
        message?: string;
      };
      return { data };
    } catch {
      return { error: 'Network error' };
    }
  },

  createCatalogItems: async (
    items: Array<{
      name: string;
      price: number;
      vendor_category?: string | null;
      delivery_time?: number | null;
      description?: string | null;
      image_url?: string | null;
      modifiers?: Array<{
        group: string;
        options: Array<{ label: string; price_delta: number }>;
      }>;
    }>,
  ) => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    return apiRequest<{
      created_count: number;
      skipped_count?: number;
      item_ids: string[];
      message?: string;
    }>('/vendors/catalog-items', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ items }),
    });
  },

  skipDocumentation: async () => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }
    return apiRequest<BusinessRegistrationSummary>('/vendors/onboarding/skip-documentation', {
      method: 'POST',
      authToken: token,
    });
  },

  completeCatalogSetup: async () => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }
    return apiRequest<BusinessRegistrationSummary>('/vendors/onboarding/complete-catalog', {
      method: 'POST',
      authToken: token,
    });
  },
};
