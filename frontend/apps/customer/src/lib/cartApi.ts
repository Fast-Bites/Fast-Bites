import api from './api';

export interface CartItemDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  section?: 'main' | 'extras';
  product_id?: string;
  /** @deprecated use product_id */
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
  product_id?: string;
  /** @deprecated use product_id */
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
  const { error } = await api.addCartItem({
    ...payload,
    product_id: payload.product_id || payload.menu_item_id,
  });
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function removeProductFromCart(
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.removeProductFromCart(productId);
  if (error) return { ok: false, error };
  return { ok: true };
}

/** @deprecated use removeProductFromCart */
export async function removeMenuItemFromCart(
  menuItemId: string,
): Promise<{ ok: boolean; error?: string }> {
  return removeProductFromCart(menuItemId);
}

/** Product IDs currently in the user's cart (any quantity). */
export async function fetchCartProductIds(): Promise<Set<string>> {
  const { orders } = await fetchCart();
  const ids = new Set<string>();
  for (const group of orders) {
    for (const item of group.items) {
      const id = item.product_id || item.menu_item_id;
      if (id) ids.add(id);
    }
  }
  return ids;
}

/** @deprecated use fetchCartProductIds */
export async function fetchCartMenuItemIds(): Promise<Set<string>> {
  return fetchCartProductIds();
}

export async function quickAddToCart(payload: {
  restaurant_id: string;
  product_id: string;
  name: string;
  unit_price: number;
  image_url?: string;
}): Promise<{ ok: boolean; error?: string }> {
  return addCartItem({
    restaurant_id: payload.restaurant_id,
    product_id: payload.product_id,
    name: payload.name,
    unit_price: payload.unit_price,
    quantity: 1,
    image_url: payload.image_url,
    section: 'main',
    options_json: {},
  });
}
