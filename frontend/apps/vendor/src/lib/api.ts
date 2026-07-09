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
  restaurant_id?: string | null;
  business_verified?: boolean;
  verification_stage?: 'registration' | 'documentation' | 'pending_review' | 'verified' | null;
}

export interface BusinessRegistrationResult {
  restaurant_id: string;
  business_verified: boolean;
  verification_submitted_at?: string | null;
}

export interface BusinessRegistrationSummary {
  restaurant_id: string;
  business_name: string;
  business_type: string;
  business_verified: boolean;
  verification_stage: 'registration' | 'documentation' | 'pending_review' | 'verified';
  documents_submitted: boolean;
}

export interface RestaurantImageUploadResult {
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

    return apiRequest<VendorProfile>('/users/profile?role=restaurant', { authToken: token });
  },
};

export const vendorApi = {
  getProfile: () => vendorAuth.getProfile(),

  uploadRestaurantImage: async (file: File, kind: 'logo' | 'cover') => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('file', file);

    try {
      const response = await fetch(`${getApiUrl()}/restaurants/upload-image`, {
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

      const data = (await response.json()) as RestaurantImageUploadResult;
      return { data };
    } catch {
      return { error: 'Network error' };
    }
  },

  uploadVerificationDocument: async (file: File, documentKey: string) => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    const formData = new FormData();
    formData.append('kind', 'document');
    formData.append('document_key', documentKey);
    formData.append('file', file);

    try {
      const response = await fetch(`${getApiUrl()}/restaurants/upload-image`, {
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

      const data = (await response.json()) as RestaurantImageUploadResult;
      return { data };
    } catch {
      return { error: 'Network error' };
    }
  },

  getBusinessRegistration: async () => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    return apiRequest<BusinessRegistrationSummary>('/restaurants/registration', { authToken: token });
  },

  submitBusinessRegistration: async (data: BusinessRegistrationFormData) => {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    return apiRequest<BusinessRegistrationResult>('/restaurants/registration', {
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

    return apiRequest<BusinessRegistrationResult>('/restaurants/verification-documents', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ documents }),
    });
  },
};
