import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Auth features will not work.');
}

/** Where Supabase stores the session: local = survives browser restart; session = tab/window session only */
const AUTH_STORAGE_MODE_KEY = 'fast_bites_auth_storage_mode';

export const REMEMBER_ME_PREF_KEY = 'fast_bites_remember_me_preferred';

function getAuthStorage(): Storage {
  // Always localStorage so the same auth session is shared across tabs (multi-role).
  if (typeof window === 'undefined') return localStorage;
  return localStorage;
}

function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: getAuthStorage(),
    },
  });
}

export let supabase = createSupabaseClient();

/**
 * Run immediately before sign-in or sign-up.
 * Session is always stored in localStorage so other tabs stay signed in when adding a role.
 * "Remember me" only persists the checkbox preference for the next visit.
 */
export function prepareAuthPersistence(rememberMe: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_MODE_KEY, 'local');
  persistRememberMeCheckboxPreference(rememberMe);
}

/** Persist last checkbox choice for default on next visit to sign-in / sign-up */
export function persistRememberMeCheckboxPreference(rememberMe: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMEMBER_ME_PREF_KEY, rememberMe ? '1' : '0');
}

export function getRememberMeCheckboxPreference(): boolean | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(REMEMBER_ME_PREF_KEY);
  if (v === '1') return true;
  if (v === '0') return false;
  return null;
}
