import api from './api';

export interface ModifierOption {
  id: string;
  label: string;
  price: number;
}

export interface MealModifiers {
  proteinOptions: ModifierOption[];
  extrasOptions: ModifierOption[];
  modifiersNote: string | null;
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
      modifiersNote: 'Could not load options.',
    };
  }

  const groups =
    (data as { groups?: Array<{ id: string; name: string; options: Array<{ id: string; label: string; price_delta: number }> }> })
      ?.groups ?? [];

  const proteinOptions: ModifierOption[] = [];
  const extrasOptions: ModifierOption[] = [];

  for (const g of groups) {
    // Legacy Size groups are ignored — sizes are separate products.
    if (isSizeGroup(g.name)) continue;

    const opts = (g.options ?? []).map((o) => ({
      id: o.id,
      label: o.label,
      price: o.price_delta,
    }));
    if (isProteinGroup(g.name)) proteinOptions.push(...opts);
    else if (isExtrasGroup(g.name)) extrasOptions.push(...opts);
    else {
      extrasOptions.push(...opts);
    }
  }

  let modifiersNote: string | null = null;
  // Empty modifiers are normal — UI hides the options block; no note needed.

  return { proteinOptions, extrasOptions, modifiersNote };
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
