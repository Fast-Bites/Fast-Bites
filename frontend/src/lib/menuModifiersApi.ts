import api from './api';

export interface ModifierOption {
  id: string;
  label: string;
  price: number;
}

export interface MealModifiers {
  sauceOptions: ModifierOption[];
  extrasOptions: ModifierOption[];
  sizeOptions: ModifierOption[];
  modifiersNote: string | null;
  sizeNote: string | null;
}

function isSauceGroup(name: string): boolean {
  return name.toLowerCase().includes('sauce');
}

function isExtrasGroup(name: string): boolean {
  return name.toLowerCase().includes('extra');
}

function isSizeGroup(name: string): boolean {
  return name.toLowerCase().includes('size');
}

export async function fetchMealModifiers(menuItemId: string): Promise<MealModifiers> {
  const { data, error } = await api.getMenuItemModifiers(menuItemId);
  if (error) {
    return {
      sauceOptions: [],
      extrasOptions: [],
      sizeOptions: [],
      modifiersNote: 'Could not load options.',
      sizeNote: 'Could not load size options.',
    };
  }

  const groups =
    (data as { groups?: Array<{ id: string; name: string; options: Array<{ id: string; label: string; price_delta: number }> }> })
      ?.groups ?? [];

  const sauceOptions: ModifierOption[] = [];
  const extrasOptions: ModifierOption[] = [];
  const sizeOptions: ModifierOption[] = [];

  for (const g of groups) {
    const opts = (g.options ?? []).map((o) => ({
      id: o.id,
      label: o.label,
      price: o.price_delta,
    }));
    if (isSizeGroup(g.name)) sizeOptions.push(...opts);
    else if (isSauceGroup(g.name)) sauceOptions.push(...opts);
    else if (isExtrasGroup(g.name)) extrasOptions.push(...opts);
  }

  let modifiersNote: string | null = null;
  if (sauceOptions.length === 0 && extrasOptions.length === 0) {
    modifiersNote = groups.length === 0 ? 'No sauce or extras for this item yet.' : null;
  }

  let sizeNote: string | null = null;
  if (sizeOptions.length === 0) {
    sizeNote = groups.length === 0 ? 'No size options for this item yet.' : 'No size options for this item yet.';
  }

  return { sauceOptions, extrasOptions, sizeOptions, modifiersNote, sizeNote };
}

export function buildSizeOptionsJson(
  sizeId: string,
  sizeLabel: string,
  sizePrice: number,
): Record<string, unknown> {
  return {
    size: sizeLabel,
    size_id: sizeId,
    size_price: sizePrice,
  };
}

export function buildOptionsJson(
  servings: Array<{ sauceId: string; sauceLabel: string; extrasId: string; extrasLabel: string }>,
  saucePrices: Record<string, number>,
  extrasPrices: Record<string, number>,
  basePrice: number,
  mealName: string,
): Record<string, unknown> {
  return {
    base_price: basePrice,
    meal_name: mealName,
    servings: servings.map((s) => ({
      sauce: s.sauceLabel || null,
      sauce_id: s.sauceId || null,
      sauce_price: s.sauceId ? saucePrices[s.sauceId] ?? 0 : 0,
      extras: s.extrasLabel || null,
      extras_id: s.extrasId || null,
      extras_price: s.extrasId ? extrasPrices[s.extrasId] ?? 0 : 0,
    })),
  };
}

export function cartItemNameForServings(mealName: string, servingCount: number): string {
  if (servingCount <= 1) return mealName;
  return `${mealName} (+${servingCount - 1})`;
}
