import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteCartItem,
  deleteCartRestaurant,
  fetchCart,
  updateCartItemQuantity,
  type RestaurantCartDto,
} from '../lib/cartApi';
import { createOrderFromCart } from '../lib/ordersApi';
import { Plus, Minus, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import OverlayChoiceModal from '../components/OverlayChoiceModal';
import ServingBreakdownPanel, { ItemNameWithServingSuffix } from '../components/ServingBreakdownPanel';
import { hasMultiServingBreakdown, parseMultiServingBreakdown } from '../lib/servingBreakdown';
import { responsivePx } from '../constants/responsive';
import { RestaurantLogo } from '../components/RestaurantMedia';

/* ── Types ─────────────────────────────────────────── */
interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  section: 'main' | 'extras';
  options_json?: Record<string, unknown>;
}

interface RestaurantOrder {
  id: string;
  name: string;
  logo?: string;
  items: CartItem[];
}

function mapCartGroup(g: RestaurantCartDto): RestaurantOrder {
  return {
    id: g.id,
    name: g.name,
    logo: g.logo,
    items: g.items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description ?? '',
      price: i.price,
      quantity: i.quantity,
      image: i.image ?? '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png',
      section: (i.section === 'extras' ? 'extras' : 'main') as 'main' | 'extras',
      options_json: i.options_json ?? {},
    })),
  };
}

/* ── Component ─────────────────────────────────────── */
const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutBusy, setCheckoutBusy] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const reloadCart = useCallback(async () => {
    const { orders: rows } = await fetchCart();
    setOrders(rows.map(mapCartGroup));
    setLoading(false);
  }, []);

  useEffect(() => {
    reloadCart();
  }, [reloadCart]);
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ restaurantId: string; itemId: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  /* helpers */
  const lineTotal = (item: CartItem) => item.price * item.quantity;
  const orderTotal = (items: CartItem[]) => items.reduce((s, i) => s + lineTotal(i), 0);
  const itemCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);

  const updateQuantity = async (restaurantId: string, itemId: string, delta: number) => {
    const group = orders.find((r) => r.id === restaurantId);
    const item = group?.items.find((i) => i.id === itemId);
    if (!item) return;
    const nextQty = Math.max(1, item.quantity + delta);
    setOrders((prev) =>
      prev.map((r) =>
        r.id !== restaurantId
          ? r
          : {
              ...r,
              items: r.items.map((i) => (i.id === itemId ? { ...i, quantity: nextQty } : i)),
            },
      ),
    );
    await updateCartItemQuantity(itemId, nextQty);
    await reloadCart();
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    await deleteCartItem(deleteTarget.itemId);
    setDeleteTarget(null);
    await reloadCart();
  };

  const removeRestaurant = async () => {
    if (!removeTarget) return;
    await deleteCartRestaurant(removeTarget);
    setRemoveTarget(null);
    setExpandedRestaurant(null);
    await reloadCart();
  };

  const proceedToOrder = async (restaurantId: string) => {
    if (checkoutBusy) return;
    setCheckoutError(null);
    setCheckoutBusy(restaurantId);
    const result = await createOrderFromCart(restaurantId);
    setCheckoutBusy(null);
    if (!result.ok) {
      setCheckoutError(result.error ?? 'Could not start your order. Please try again.');
      return;
    }
    navigate('/orders');
  };

  const detailRestaurant =
    expandedRestaurant != null ? orders.find((r) => r.id === expandedRestaurant) ?? null : null;

  const toggleExpand = (id: string) =>
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderItemCard = (restaurant: RestaurantOrder, item: CartItem) => {
    const breakdown = parseMultiServingBreakdown(item.name, item.options_json);
    const isOpen = breakdown !== null && !!expandedItems[item.id];

    return (
      <div
        key={item.id}
        className={`mb-4 rounded-xl bg-overlay-panel-background ${
          breakdown && isOpen ? 'relative z-30 shadow-2xl' : ''
        } ${breakdown ? '' : 'overflow-hidden'}`}
      >
        <div className={breakdown ? 'overflow-hidden rounded-t-xl' : ''}>
          <div className="flex items-stretch gap-3 p-2">
            <div className="h-26 w-26 flex-shrink-0 overflow-hidden rounded-lg">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 min-w-0 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-foreground font-semibold text-lg leading-tight">
                  <ItemNameWithServingSuffix name={item.name} />
                </h4>
                {breakdown && isOpen ? (
                  <span aria-hidden className="text-foreground/80 pt-1">
                    <MoreHorizontal className="h-5 w-5" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ restaurantId: restaurant.id, itemId: item.id })}
                    aria-label="Delete item"
                    className="text-foreground hover:text-foreground"
                  >
                    <img src="/assets/delete-white-2.png" alt="" className="h-5 w-5 object-contain" />
                  </button>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              <p className="mt-1 text-primary font-regular text-lg">₦{lineTotal(item).toLocaleString()}</p>
              <div className="mt-auto flex items-center justify-end gap-1 pt-0">
                <div className="flex bg-black rounded-full items-center">
                  <button
                    type="button"
                    onClick={() => updateQuantity(restaurant.id, item.id, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4 text-black" strokeWidth={2.5} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(restaurant.id, item.id, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {breakdown && isOpen && <ServingBreakdownPanel breakdown={breakdown} />}
        </div>

        {breakdown && (
          <button
            type="button"
            onClick={() => toggleExpand(item.id)}
            className={`flex w-full items-center justify-center gap-2 text-xs py-1.5 rounded-b-xl bg-primary text-primary-foreground`}
          >
            {isOpen ? 'See less' : 'See more'}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  };

  const anyServingDropdownOpen =
    detailRestaurant != null &&
    detailRestaurant.items.some(
      (item) =>
        hasMultiServingBreakdown(item.options_json, item.name) && expandedItems[item.id],
    );

  return (
    <div className="relative w-full min-h-screen bg-background font-[var(--font-poppins)]">
      <div className={`absolute top-0 left-0 right-0 z-[50] ${responsivePx} pt-10`}>
        <BackButton
          variant="map"
          title="Cart"
          {...(detailRestaurant ? { onBack: () => setExpandedRestaurant(null) } : {})}
        />
      </div>
      <div className="h-20" />

      <div
        className={`${responsivePx} mt-6 ${
          detailRestaurant && !anyServingDropdownOpen
            ? 'pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]'
            : 'pb-10'
        }`}
      >
        {detailRestaurant ? (
          <>
            <p className="mb-5 border-b border-primary-foreground/30 pb-1 text-sm text-muted-foreground">
              {detailRestaurant.name}
            </p>
            {detailRestaurant.items.map((item) => renderItemCard(detailRestaurant, item))}
          </>
        ) : loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading cart…</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">Your cart is empty</div>
        ) : (
          <>
            {checkoutError && (
              <p className="mb-4 text-center text-sm text-red-400">{checkoutError}</p>
            )}
            {orders.map((restaurant) => (
            <div key={restaurant.id} className="mb-4 rounded-xl bg-overlay-panel-background px-2 py-5">
              <div className="mb-6 flex w-full min-w-0 items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  <RestaurantLogo
                    logoUrl={restaurant.logo}
                    alt={restaurant.name}
                    containerClassName="rounded-full"
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
                      {restaurant.name}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setExpandedRestaurant(restaurant.id)}
                      className="flex-shrink-0 text-xs text-white underline"
                    >
                      Show items
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {itemCount(restaurant.items)} Items | ₦{orderTotal(restaurant.items).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={checkoutBusy === restaurant.id}
                  onClick={() => proceedToOrder(restaurant.id)}
                  className="flex-1 rounded-xl bg-popup-green py-3 text-sm text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {checkoutBusy === restaurant.id ? 'Please wait…' : 'Checkout'}
                </button>
                <button
                  onClick={() => setRemoveTarget(restaurant.id)}
                  className="flex-1 rounded-xl border-2 border-primary py-3 text-sm text-primary transition-opacity hover:opacity-80"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          </>
        )}
      </div>

      {/* Proceed to order — hidden while a multi-serving breakdown dropdown is open */}
      {detailRestaurant && !anyServingDropdownOpen && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-overlay-panel-background ${responsivePx} pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]`}
        >
          <Button
            onClick={() => detailRestaurant && proceedToOrder(detailRestaurant.id)}
            variant="primary"
            disabled={!detailRestaurant || checkoutBusy === detailRestaurant?.id}
          >
            {checkoutBusy === detailRestaurant?.id ? 'Please wait…' : 'Proceed to order'}
          </Button>
        </div>
      )}

      <OverlayChoiceModal
        open={!!deleteTarget}
        onBackdropClick={() => setDeleteTarget(null)}
        title="Delete item?"
        actions={[
          { label: 'Yes', variant: 'green', onClick: deleteItem },
          { label: 'No', variant: 'primary', onClick: () => setDeleteTarget(null) },
        ]}
      />

      <OverlayChoiceModal
        open={removeTarget !== null}
        onBackdropClick={() => setRemoveTarget(null)}
        title="Remove order?"
        actions={[
          { label: 'Yes', variant: 'green', onClick: removeRestaurant },
          { label: 'No', variant: 'primary', onClick: () => setRemoveTarget(null) },
        ]}
      />
    </div>
  );
};

export default Cart;
