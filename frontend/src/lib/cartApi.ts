import api from './api';

export interface CartItemDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  section?: 'main' | 'extras';
  menu_item_id?: string;
  options_json?: Record<string, unknown>;
}

export interface RestaurantCartDto {
  id: string;
  name: string;
  logo?: string;
  items: CartItemDto[];
}

export async function fetchCart(): Promise<{
  orders: RestaurantCartDto[];
  error?: string;
}> {
  const { data, error } = await api.getCart();
  if (error) return { orders: [], error };
  const orders = (data as { orders?: RestaurantCartDto[] })?.orders ?? [];
  return { orders };
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.patchCartItem(itemId, { quantity });
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function deleteCartItem(itemId: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.deleteCartItem(itemId);
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function deleteCartRestaurant(restaurantId: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.deleteCartRestaurant(restaurantId);
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function addCartItem(payload: {
  restaurant_id: string;
  menu_item_id?: string;
  name: string;
  description?: string;
  unit_price: number;
  quantity?: number;
  image_url?: string;
  section?: string;
  options_json?: Record<string, unknown>;
  special_instructions?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.addCartItem(payload);
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function removeMenuItemFromCart(
  menuItemId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.removeMenuItemFromCart(menuItemId);
  if (error) return { ok: false, error };
  return { ok: true };
}

/** Menu item IDs currently in the user's cart (any quantity). */
export async function fetchCartMenuItemIds(): Promise<Set<string>> {
  const { orders } = await fetchCart();
  const ids = new Set<string>();
  for (const group of orders) {
    for (const item of group.items) {
      if (item.menu_item_id) ids.add(item.menu_item_id);
    }
  }
  return ids;
}

export async function quickAddToCart(payload: {
  restaurant_id: string;
  menu_item_id: string;
  name: string;
  unit_price: number;
  image_url?: string;
}): Promise<{ ok: boolean; error?: string }> {
  return addCartItem({
    restaurant_id: payload.restaurant_id,
    menu_item_id: payload.menu_item_id,
    name: payload.name,
    unit_price: payload.unit_price,
    quantity: 1,
    image_url: payload.image_url,
    section: 'main',
    options_json: {},
  });
}
