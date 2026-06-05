import api from './api';

export interface OrderTabItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  restaurant: string;
  options_json?: Record<string, unknown>;
}

export interface TrackingStep {
  label: string;
  description: string;
  time: string;
  completed: boolean;
  showView?: boolean;
}

export interface OngoingOrder {
  orderId: string;
  deliveryTime: string;
  steps: TrackingStep[];
}

export async function fetchOrderSummary(): Promise<{
  items: OrderTabItem[];
  deliveryFee: number;
  ongoing: OngoingOrder | null;
  pendingOrderId: string | null;
  error?: string;
}> {
  const { data, error } = await api.getOrderSummary();
  if (error) return { items: [], deliveryFee: 1500, ongoing: null, pendingOrderId: null, error };
  const dto = data as {
    items?: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      quantity: number;
      image?: string;
      restaurant: string;
      options_json?: Record<string, unknown>;
    }>;
    delivery_fee?: number;
    pending_order_id?: string | null;
    ongoing?: {
      order_id: string;
      delivery_time: string;
      steps: Array<{
        label: string;
        description: string;
        time: string;
        completed: boolean;
        show_view: boolean;
      }>;
    };
  };
  const items = (dto?.items ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description ?? '',
    price: i.price,
    quantity: i.quantity,
    image: i.image ?? '',
    restaurant: i.restaurant,
    options_json: i.options_json ?? {},
  }));
  const ongoing = dto?.ongoing
    ? {
        orderId: dto.ongoing.order_id,
        deliveryTime: dto.ongoing.delivery_time,
        steps: dto.ongoing.steps.map((s) => ({
          label: s.label,
          description: s.description,
          time: s.time,
          completed: s.completed,
          showView: s.show_view,
        })),
      }
    : null;
  return {
    items,
    deliveryFee: dto?.delivery_fee ?? 1500,
    ongoing,
    pendingOrderId: dto?.pending_order_id ?? null,
  };
}

export async function createOrderFromCart(
  restaurantId: string,
): Promise<{ ok: boolean; orderId?: string; error?: string }> {
  const { data, error } = await api.createOrderFromCart(restaurantId);
  if (error) return { ok: false, error };
  const orderId = (data as { order_id?: string })?.order_id;
  if (!orderId) return { ok: false, error: 'Could not create order.' };
  return { ok: true, orderId };
}

export async function confirmOrderCheckout(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.confirmOrderCheckout(orderId);
  if (error) return { ok: false, error };
  return { ok: true };
}
