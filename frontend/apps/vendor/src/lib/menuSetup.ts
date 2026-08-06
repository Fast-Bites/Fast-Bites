export const MENU_SETUP_PAGE_SUBTITLE = 'Register to get your business onboard';

export const MENU_SECTION_TITLE = 'Menu';
export const MENU_SECTION_DESCRIPTION = 'What customers can order from your store';

export const UPLOAD_OPTIONS_TITLE = 'Upload options';
export const UPLOAD_OPTIONS_DESCRIPTION =
  "Choose how you'd like to add your menu. You can always edit it later.";

export const MENU_SETUP_OPTIONS = [
  { id: 'scan', label: 'Scan menu' },
  { id: 'upload', label: 'Upload menu file' },
  { id: 'manual', label: 'Create manually' },
] as const;

export type MenuSetupOptionId = (typeof MENU_SETUP_OPTIONS)[number]['id'];

export interface CatalogModifierOption {
  label: string;
  price_delta: number;
}

export interface CatalogModifierGroup {
  group: 'protein' | 'extras' | 'size' | string;
  options: CatalogModifierOption[];
}

export interface MenuItemDraft {
  id: string;
  name: string;
  price: string;
  portionSize: string;
  duration: string;
  /** Free-text label the vendor uses (backend maps to platform category) */
  vendorCategory: string;
  /** Extracted meal customizations — passed through on save (restaurants) */
  modifiers: CatalogModifierGroup[];
}

export function createEmptyMenuItem(id?: string): MenuItemDraft {
  return {
    id: id ?? `menu-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    price: '',
    portionSize: '',
    duration: '',
    vendorCategory: '',
    modifiers: [],
  };
}

/** Parse HH:MM:SS (or MM:SS / minutes) into delivery_time minutes. */
export function durationToMinutes(duration: string): number | null {
  const trimmed = duration.trim();
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(':').map((part) => Number(part));
  if (parts.some((n) => Number.isNaN(n) || n < 0)) {
    return null;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return Math.round(hours * 60 + minutes + seconds / 60);
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return Math.round(minutes + seconds / 60);
  }
  if (parts.length === 1) {
    return Math.round(parts[0]);
  }
  return null;
}

export function parsePriceInput(price: string): number | null {
  const normalized = price.replace(/,/g, '').trim();
  if (!normalized) {
    return null;
  }
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

/** Format minutes as HH:MM:SS for the duration field. */
export function minutesToDuration(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) {
    return '';
  }
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

export const PORTION_SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'Regular'] as const;

export const MENU_SCAN_ACCEPT = 'image/jpeg,image/png,image/webp';
export const MENU_SCAN_ACCEPT_HINT = 'JPEG, PNG, WebP';

export const MENU_UPLOAD_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,application/pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const MENU_UPLOAD_ACCEPT_HINT =
  'JPEG, PNG, WebP, GIF, PDF, DOC, DOCX, CSV, XLS, XLSX, TXT';

export function isMenuImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/** Short uppercase label for the upload tile (e.g. PDF, CSV, TXT). */
export function menuFileTypeLabel(file: File): string {
  const fromName = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.') + 1).toUpperCase()
    : '';
  if (fromName) {
    return fromName;
  }
  if (file.type.startsWith('image/')) {
    return file.type.replace('image/', '').toUpperCase();
  }
  if (file.type === 'application/pdf') {
    return 'PDF';
  }
  if (file.type === 'text/plain') {
    return 'TXT';
  }
  if (file.type === 'text/csv' || file.type === 'application/csv') {
    return 'CSV';
  }
  if (file.type === 'application/msword') {
    return 'DOC';
  }
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'DOCX';
  }
  if (file.type === 'application/vnd.ms-excel') {
    return 'XLS';
  }
  if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'XLSX';
  }
  return 'FILE';
}

export type MenuFileTypeTheme = {
  backdrop: string;
  shell: string;
  header: string;
  headerText: string;
  icon: string;
  body: string;
  watermark: string;
};

/** Brand-like colors per document family for the non-image preview card. */
export function menuFileTypeTheme(label: string | null | undefined): MenuFileTypeTheme {
  const key = (label || 'FILE').toUpperCase();

  if (key === 'PDF') {
    return {
      backdrop: 'bg-red-50/70',
      shell: 'border-red-200 bg-white',
      header: 'border-red-100 bg-red-50',
      headerText: 'text-red-700',
      icon: 'text-red-600',
      body: 'from-white to-red-50/70',
      watermark: 'text-red-500/20',
    };
  }

  if (key === 'DOC' || key === 'DOCX') {
    return {
      backdrop: 'bg-blue-50/70',
      shell: 'border-blue-200 bg-white',
      header: 'border-blue-100 bg-blue-50',
      headerText: 'text-blue-700',
      icon: 'text-blue-600',
      body: 'from-white to-blue-50/70',
      watermark: 'text-blue-500/20',
    };
  }

  if (key === 'XLS' || key === 'XLSX' || key === 'CSV') {
    return {
      backdrop: 'bg-emerald-50/70',
      shell: 'border-emerald-200 bg-white',
      header: 'border-emerald-100 bg-emerald-50',
      headerText: 'text-emerald-700',
      icon: 'text-emerald-600',
      body: 'from-white to-emerald-50/70',
      watermark: 'text-emerald-500/20',
    };
  }

  if (key === 'TXT') {
    return {
      backdrop: 'bg-slate-50/80',
      shell: 'border-slate-200 bg-white',
      header: 'border-slate-100 bg-slate-100',
      headerText: 'text-slate-700',
      icon: 'text-slate-600',
      body: 'from-white to-slate-50',
      watermark: 'text-slate-400/25',
    };
  }

  return {
    backdrop: 'bg-primary/10',
    shell: 'border-primary/25 bg-white',
    header: 'border-primary/15 bg-primary/15',
    headerText: 'text-primary',
    icon: 'text-primary',
    body: 'from-white to-primary/5',
    watermark: 'text-primary/15',
  };
}

export const MENU_SETUP_DONE_KEY = 'vendor_menu_setup_done';
export const DOCUMENTATION_SKIPPED_KEY = 'vendor_documentation_skipped';

export function isMenuSetupDone(): boolean {
  return sessionStorage.getItem(MENU_SETUP_DONE_KEY) === '1';
}

export function markMenuSetupDone(): void {
  sessionStorage.setItem(MENU_SETUP_DONE_KEY, '1');
}

export function clearMenuSetupDone(): void {
  sessionStorage.removeItem(MENU_SETUP_DONE_KEY);
}

export function isDocumentationSkipped(): boolean {
  return sessionStorage.getItem(DOCUMENTATION_SKIPPED_KEY) === '1';
}

export function markDocumentationSkipped(): void {
  sessionStorage.setItem(DOCUMENTATION_SKIPPED_KEY, '1');
}

export function clearDocumentationSkipped(): void {
  sessionStorage.removeItem(DOCUMENTATION_SKIPPED_KEY);
}
