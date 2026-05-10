import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import OverlayChoiceModal from '../components/OverlayChoiceModal';
import { responsivePx } from '../constants/responsive';

/* ── Types ─────────────────────────────────────────── */
interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  section: 'main' | 'extras';
}

interface RestaurantOrder {
  id: string;
  name: string;
  logo: string;
  items: CartItem[];
}

/* ── Dummy data ────────────────────────────────────── */
const DUMMY_ORDERS: RestaurantOrder[] = [
  {
    id: 'r1',
    name: 'Chicken Republic',
    logo: '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png',
    items: [
      { id: 'i1', name: 'Rice', description: 'Properly cooked plain local rice', price: 5000, quantity: 1, image: '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png', section: 'main' },
      { id: 'i2', name: 'Rice (+1)', description: 'Extra portion of local rice', price: 5000, quantity: 1, image: '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png', section: 'main' },
      { id: 'i3', name: 'Stew', description: 'Fresh tomato stew', price: 1500, quantity: 1, image: '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png', section: 'extras' },
      { id: 'i4', name: 'Boiled Egg', description: 'Boiled egg garnish', price: 500, quantity: 2, image: '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png', section: 'extras' },
      { id: 'i5', name: 'Chicken', description: 'Grilled chicken piece', price: 3000, quantity: 1, image: '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png', section: 'extras' },
    ],
  },
  {
    id: 'r2',
    name: "Domino's Pizza",
    logo: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop',
    items: [
      { id: 'i6', name: 'Blueberry Pancake', description: 'Fluffy cream filled blueberry pancake', price: 1500, quantity: 1, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', section: 'main' },
    ],
  },
];

/* ── Component ─────────────────────────────────────── */
const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RestaurantOrder[]>(DUMMY_ORDERS);
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ restaurantId: string; itemId: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  /* helpers */
  const orderTotal = (items: CartItem[]) => items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);

  const updateQuantity = (restaurantId: string, itemId: string, delta: number) => {
    setOrders((prev) =>
      prev.map((r) =>
        r.id === restaurantId
          ? { ...r, items: r.items.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)) }
          : r,
      ),
    );
  };

  const deleteItem = () => {
    if (!deleteTarget) return;
    setOrders((prev) =>
      prev
        .map((r) =>
          r.id === deleteTarget.restaurantId
            ? { ...r, items: r.items.filter((i) => i.id !== deleteTarget.itemId) }
            : r,
        )
        .filter((r) => r.items.length > 0),
    );
    setDeleteTarget(null);
  };

  const removeRestaurant = () => {
    if (!removeTarget) return;
    setOrders((prev) => prev.filter((r) => r.id !== removeTarget));
    setRemoveTarget(null);
    setExpandedRestaurant(null);
  };

  const detailRestaurant =
    expandedRestaurant != null ? orders.find((r) => r.id === expandedRestaurant) ?? null : null;

  const toggleExpand = (id: string) =>
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  /** True when this line item represents multiple separate servings (name ends with " (+N)"). */
  const itemHasMultiServingBreakdown = (name: string) => /\s*\(\+\d+\)$/.test(name);

  /** Splits trailing " (+N)" so the suffix can use primary pill styling (e.g. extra servings). */
  const renderItemName = (name: string) => {
    const match = name.match(/^(.*?)(\s*\(\+\d+\))$/);
    if (!match) return name;
    const [, base, suffixWithSpace] = match;
    const suffix = suffixWithSpace.trim();
    return (
      <>
        {base}
        <span className="ml-1 inline-block align-middle text-lg font-semibold text-primary">
          {suffix}
        </span>
      </>
    );
  };

  // Demo breakdown data — would come from item customization in real data
  const getBreakdown = () => ({
    sauce: { name: 'Stew', price: 800 },
    secondServing: {
      main: { name: 'Rice', price: 1500 },
      sauce: { name: 'Cabbage sauce', price: 1200 },
      extras: [
        { name: 'Fried plantains', price: 700 },
        { name: 'Boiled egg', price: 100 },
        { name: 'Pepper meat', price: 1000 },
        { name: 'Snail', price: 850 },
        { name: 'Gizzard', price: 900 },
      ],
    },
  });

  const renderItemCard = (restaurant: RestaurantOrder, item: CartItem) => {
    const hasBreakdown = itemHasMultiServingBreakdown(item.name);
    const isOpen = hasBreakdown && !!expandedItems[item.id];
    const breakdown = hasBreakdown ? getBreakdown() : null;

    return (
      <div
        key={item.id}
        className={`mb-4 rounded-xl bg-overlay-panel-background ${
          hasBreakdown && isOpen ? 'relative z-30 shadow-2xl' : ''
        } ${hasBreakdown ? '' : 'overflow-hidden'}`}
      >
        <div className={hasBreakdown ? 'overflow-hidden rounded-t-xl' : ''}>
          <div className="flex items-stretch gap-3 p-2">
            <div className="h-26 w-26 flex-shrink-0 overflow-hidden rounded-lg">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 min-w-0 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-foreground font-semibold text-lg leading-tight">
                  {renderItemName(item.name)}
                </h4>
                {hasBreakdown && isOpen ? (
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
              <p className="mt-1 text-primary font-regular text-lg">₦{item.price.toLocaleString()}</p>
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

          {hasBreakdown && isOpen && breakdown && (
            <div className="px-4 py-6 space-y-4 border-t-3 border-t-black/40">
              <div>
                <p className="text-xs text-muted-foreground/70">Sauce:</p>
                <div className="flex items-center justify-between border-b border-white/40 pb-1">
                  <span className="text-foreground text-base">{breakdown.sauce.name}</span>
                  <span className="text-foreground text-base">₦{breakdown.sauce.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <h5 className="text-foreground text-xl">Second serving</h5>
                <div>
                  <p className="text-xs text-muted-foreground/70">Main:</p>
                  <div className="flex items-center justify-between border-b border-white/40 pb-1">
                    <span className="text-foreground text-base">{breakdown.secondServing.main.name}</span>
                    <span className="text-foreground text-base">₦{breakdown.secondServing.main.price.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70">Sauce:</p>
                  <div className="flex items-center justify-between border-b border-white/40 pb-1">
                    <span className="text-foreground text-base">{breakdown.secondServing.sauce.name}</span>
                    <span className="text-foreground text-base">₦{breakdown.secondServing.sauce.price.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70 mb-1">Extras:</p>
                  <div className="space-y-1.5">
                    {breakdown.secondServing.extras.map((ex) => (
                      <div key={ex.name} className="flex items-center justify-between">
                        <span className="text-foreground text-base">{ex.name}</span>
                        <span className="text-foreground text-base">₦{ex.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {hasBreakdown && (
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
      (item) => itemHasMultiServingBreakdown(item.name) && expandedItems[item.id],
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
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">Your cart is empty</div>
        ) : (
          orders.map((restaurant) => (
            <div key={restaurant.id} className="mb-4 rounded-xl bg-overlay-panel-background px-2 py-5">
              <div className="mb-6 flex w-full min-w-0 items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  <img src={restaurant.logo} alt={restaurant.name} className="h-full w-full object-cover" />
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
                  onClick={() => navigate('/orders')}
                  className="flex-1 rounded-xl bg-popup-green py-3 text-sm text-black transition-opacity hover:opacity-90"
                >
                  Checkout
                </button>
                <button
                  onClick={() => setRemoveTarget(restaurant.id)}
                  className="flex-1 rounded-xl border-2 border-primary py-3 text-sm text-primary transition-opacity hover:opacity-80"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Proceed to order — hidden while a multi-serving breakdown dropdown is open */}
      {detailRestaurant && !anyServingDropdownOpen && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-overlay-panel-background ${responsivePx} pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]`}
        >
          <Button onClick={() => navigate('/orders')} variant="primary">
            Proceed to order
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
