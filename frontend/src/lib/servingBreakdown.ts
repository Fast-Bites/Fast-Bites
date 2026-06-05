export interface ServingLine {
  sauce: string | null;
  saucePrice: number;
  extras: string | null;
  extrasPrice: number;
}

export interface ExtraServingBreakdown {
  label: string;
  line: ServingLine;
}

export interface MultiServingBreakdown {
  mealName: string;
  basePrice: number;
  firstServing: ServingLine;
  extraServings: ExtraServingBreakdown[];
}

function parseServingLine(raw: Record<string, unknown>): ServingLine {
  return {
    sauce: typeof raw.sauce === 'string' ? raw.sauce : null,
    saucePrice: Number(raw.sauce_price) || 0,
    extras: typeof raw.extras === 'string' ? raw.extras : null,
    extrasPrice: Number(raw.extras_price) || 0,
  };
}

export function stripServingSuffix(name: string): string {
  return name.replace(/\s*\(\+\d+\)$/, '').trim();
}

export function servingSectionLabel(index: number): string {
  if (index === 0) return 'Second serving';
  if (index === 1) return 'Third serving';
  return `${index + 2}th serving`;
}

export function hasMultiServingBreakdown(
  optionsJson?: Record<string, unknown> | null,
  itemName?: string,
): boolean {
  const servings = optionsJson?.servings;
  if (Array.isArray(servings) && servings.length > 1) return true;
  if (itemName) return /\s*\(\+\d+\)$/.test(itemName);
  return false;
}

export function parseMultiServingBreakdown(
  itemName: string,
  optionsJson?: Record<string, unknown> | null,
): MultiServingBreakdown | null {
  const rawServings = optionsJson?.servings;
  if (!Array.isArray(rawServings) || rawServings.length <= 1) return null;

  const mealName =
    (typeof optionsJson?.meal_name === 'string' && optionsJson.meal_name) ||
    stripServingSuffix(itemName);
  const basePrice = Number(optionsJson?.base_price) || 0;
  const firstServing = parseServingLine(rawServings[0] as Record<string, unknown>);
  const extraServings = rawServings.slice(1).map((row, index) => ({
    label: servingSectionLabel(index),
    line: parseServingLine(row as Record<string, unknown>),
  }));

  return { mealName, basePrice, firstServing, extraServings };
}

export function splitItemNameWithServingSuffix(name: string): { base: string; suffix: string } | null {
  const match = name.match(/^(.*?)(\s*\(\+\d+\))$/);
  if (!match) return null;
  return { base: match[1], suffix: match[2].trim() };
}
