import { apiRequest } from '@fast-bites/api-client';
import type { UserRole } from '@fast-bites/shared';
import { supabase } from './supabase';

export interface VendorProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  restaurant_id?: string | null;
  /** Set by backend once business verification is implemented. */
  business_verified?: boolean;
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
};
