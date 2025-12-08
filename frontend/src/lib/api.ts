import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8004";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Get auth token for API calls
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  auth = false
): Promise<ApiResponse<T>> {
  try {
    const authHeaders = auth ? await getAuthHeaders() : {};
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.detail || "Request failed" };
    }

    const data = await response.json();
    return { data };
  } catch {
    return { error: "Network error" };
  }
}

// Auth - using Supabase
export const auth = {
  signup: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/signup-form-2`,
      }
    });
    if (error) return { error: error.message };
    return { data };
  },

  // Verify OTP code from email
  verifyOtp: async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error) return { error: error.message };
    return { data };
  },

  signin: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { data };
  },

  signout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { data: { message: 'Signed out' } };
  },

  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { data: { message: 'Reset email sent' } };
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { data: { message: 'Password updated' } };
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return { error: error.message };
    return { data: session };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return { error: error.message };
    return { data: user };
  },

  resendConfirmation: async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) return { error: error.message };
    return { data: { message: 'Confirmation email sent' } };
  },
};

// Profile/Users - calls backend API
export const api = {
  // Create/update user profile after signup
  createProfile: (data: {
    first_name: string;
    last_name: string;
    phone?: string;
    dob?: string;
    role?: string;
  }) => request("/users/profile", { method: "POST", body: JSON.stringify(data) }, true),

  getProfile: () => request("/users/profile", {}, true),

  updateProfile: (data: Record<string, unknown>) =>
    request("/users/profile", { method: "PUT", body: JSON.stringify(data) }, true),

  deleteProfile: () =>
    request("/users/profile", { method: "DELETE" }, true),
};

export default api;

