export type MenuCategory = 'Food' | 'Drinks' | 'Desserts' | 'Sides';

export type RestaurantMenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  price: string;
  duration: string;
  protein: string;
  extra: string;
  image: string | null;
  createdAt: number;
};

const STORAGE_KEY = 'vendor_restaurant_menu_items';

function readItems(): RestaurantMenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RestaurantMenuItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeItems(items: RestaurantMenuItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getRestaurantMenuItems(): RestaurantMenuItem[] {
  return readItems().sort((a, b) => b.createdAt - a.createdAt);
}

export function getRestaurantMenuItem(id: string): RestaurantMenuItem | null {
  return readItems().find((item) => item.id === id) ?? null;
}

export function addRestaurantMenuItem(
  input: Omit<RestaurantMenuItem, 'id' | 'createdAt'>,
): RestaurantMenuItem {
  const item: RestaurantMenuItem = {
    ...input,
    id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  writeItems([item, ...readItems()]);
  return item;
}

export function updateRestaurantMenuItem(
  id: string,
  input: Omit<RestaurantMenuItem, 'id' | 'createdAt'>,
): RestaurantMenuItem | null {
  const items = readItems();
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const updated: RestaurantMenuItem = {
    ...items[index],
    ...input,
    id,
  };
  const next = [...items];
  next[index] = updated;
  writeItems(next);
  return updated;
}

export function formatMenuPrice(value: string): string {
  const digits = value.replace(/[^\d.]/g, '');
  const amount = Number(digits);
  if (!Number.isFinite(amount) || digits === '') {
    return value.startsWith('₦') ? value : `₦${value}`;
  }
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read image'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}
