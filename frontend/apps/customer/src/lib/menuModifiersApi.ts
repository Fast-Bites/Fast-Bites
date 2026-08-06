import api from './api';

export interface ModifierOption {
  id: string;
  label: string;
  price: number;
}

export interface MealModifiers {
  proteinOptions: ModifierOption[];
  extrasOptions: ModifierOption[];
  sizeOptions: ModifierOption[];
  modifiersNote: string | null;
  sizeNote: string | null;
}

function isProteinGroup(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes('protein') || n.includes('meat') || n.includes('choice of protein');
}

function isExtrasGroup(name: string): boolean {
  const n = name.toLowerCase();
  // Sauces fold into extras (no separate sauce group)
  return (
    n.includes('extra') ||
    n.includes('sauce') ||
    n.includes('topping') ||
    n.includes('add-on') ||
    n.includes('addon')
  );
}

function isSizeGroup(name: string): boolean {
  return name.toLowerCase().includes('size');
}

export async function fetchMealModifiers(menuItemId: string): Promise<MealModifiers> {
  const { data, error } = await api.getMenuItemModifiers(menuItemId);
  if (error) {
    return {
      proteinOptions: [],
      extrasOptions: [],
      sizeOptions: [],
      modifiersNote: 'Could not load options.',
      sizeNote: 'Could not load size options.',
    };
  }

  const groups =
    (data as { groups?: Array<{ id: string; name: string; options: Array<{ id: string; label: string; price_delta: number }> }> })
      ?.groups ?? [];

  const proteinOptions: ModifierOption[] = [];
  const extrasOptions: ModifierOption[] = [];
  const sizeOptions: ModifierOption[] = [];

  for (const g of groups) {
    const opts = (g.options ?? []).map((o) => ({
      id: o.id,
      label: o.label,
      price: o.price_delta,
    }));
    if (isSizeGroup(g.name)) sizeOptions.push(...opts);
    else if (isProteinGroup(g.name)) proteinOptions.push(...opts);
    else if (isExtrasGroup(g.name)) extrasOptions.push(...opts);
    else {
      // Unknown group names → extras (safe default)
      extrasOptions.push(...opts);
    }
  }

  let modifiersNote: string | null = null;
  if (proteinOptions.length === 0 && extrasOptions.length === 0) {
    modifiersNote = groups.length === 0 ? 'No protein or extras for this item yet.' : null;
  }

  let sizeNote: string | null = null;
  if (sizeOptions.length === 0) {
    sizeNote = 'No size options for this item yet.';
  }

  return { proteinOptions, extrasOptions, sizeOptions, modifiersNote, sizeNote };
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
  servings: Array<{
    proteinId: string;
    proteinLabel: string;
    extrasId: string;
    extrasLabel: string;
  }>,
  proteinPrices: Record<string, number>,
  extrasPrices: Record<string, number>,
  basePrice: number,
  mealName: string,
): Record<string, unknown> {
  return {
    base_price: basePrice,
    meal_name: mealName,
    servings: servings.map((s) => ({
      protein: s.proteinLabel || null,
      protein_id: s.proteinId || null,
      protein_price: s.proteinId ? proteinPrices[s.proteinId] ?? 0 : 0,
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
