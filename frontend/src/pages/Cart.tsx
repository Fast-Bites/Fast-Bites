import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import ConfirmDialog from '../components/ConfirmDialog';
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

  /* ── Detail view for a single restaurant ─────────── */
  if (expandedRestaurant) {
    const restaurant = orders.find((r) => r.id === expandedRestaurant);
    if (!restaurant) {
      setExpandedRestaurant(null);
      return null;
    }

    const mainItems = restaurant.items.filter((i) => i.section === 'main');
    const extraItems = restaurant.items.filter((i) => i.section === 'extras');

    const renderSection = (label: string, items: CartItem[]) => (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-foreground font-semibold text-base">{label}:</h3>
        </div>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-overlay-panel-background rounded-xl p-3 mb-2">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-foreground font-medium text-sm truncate">{item.name}</h4>
                <button onClick={() => setDeleteTarget({ restaurantId: restaurant.id, itemId: item.id })}>
                  <img src="/assets/delete.svg" alt="Delete" className="w-4 h-4 opacity-60" />
                </button>
              </div>
              <p className="text-muted-foreground text-xs truncate">{item.description}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-primary font-bold text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(restaurant.id, item.id, -1)}
                    className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
                  >
                    −
                  </button>
                  <span className="text-foreground text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(restaurant.id, item.id, 1)}
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between mt-1 px-1">
          <span className="text-muted-foreground text-xs">{itemCount(items)} Items</span>
          <span className="text-foreground font-bold text-sm">₦{orderTotal(items).toLocaleString()}</span>
        </div>
      </div>
    );

    return (
      <div className="w-full min-h-screen bg-background font-[var(--font-poppins)]">
        <PageHeader title={restaurant.name} onBack={() => setExpandedRestaurant(null)} />
        <div className="h-20" />

        <div className={`${responsivePx} pb-28`}>
          {mainItems.length > 0 && renderSection('Main', mainItems)}
          {extraItems.length > 0 && renderSection('Extras', extraItems)}

          {/* Proceed button */}
          <button
            onClick={() => navigate('/order')}
            className="w-full mt-6 py-4 rounded-full bg-app-green text-background font-semibold text-lg transition-opacity hover:opacity-90 active:opacity-80"
          >
            Proceed to order
          </button>
        </div>

        <ConfirmDialog
          visible={!!deleteTarget}
          title="Delete item?"
          message="Are you sure you want to remove this item from your cart?"
          confirmLabel="Delete"
          cancelLabel="Keep"
          confirmVariant="danger"
          onConfirm={deleteItem}
          onCancel={() => setDeleteTarget(null)}
        />
        <BottomNav />
      </div>
    );
  }

  /* ── List view (all restaurants) ─────────────────── */
  return (
    <div className="w-full min-h-screen bg-background font-[var(--font-poppins)]">
      <PageHeader title="Cart" />
      <div className="h-20" />

      <div className={`${responsivePx} pb-28`}>
        {orders.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">Your cart is empty</div>
        ) : (
          orders.map((restaurant) => (
            <div key={restaurant.id} className="bg-overlay-panel-background rounded-2xl p-4 mb-4">
              {/* Restaurant header row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-foreground font-semibold text-base flex-1">{restaurant.name}</h2>
              </div>

              {/* Show items toggle */}
              <button
                onClick={() => setExpandedRestaurant(restaurant.id)}
                className="flex items-center gap-2 mb-3 text-primary text-sm font-medium"
              >
                <span>Show items</span>
                <img src="/assets/Back.svg" alt="" className="w-3 h-3 rotate-180" />
              </button>

              {/* Summary */}
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">{itemCount(restaurant.items)} Items</span>
                <span className="text-foreground font-bold">₦{orderTotal(restaurant.items).toLocaleString()}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/order')}
                  className="flex-1 py-3 rounded-full bg-app-green text-background font-semibold text-sm transition-opacity hover:opacity-90"
                >
                  Checkout
                </button>
                <button
                  onClick={() => setRemoveTarget(restaurant.id)}
                  className="flex-1 py-3 rounded-full border-2 border-primary text-primary font-semibold text-sm transition-opacity hover:opacity-80"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}

        {orders.length > 1 && (
          <button className="w-full text-center text-primary text-sm font-medium py-2">
            See more
          </button>
        )}
      </div>

      <ConfirmDialog
        visible={!!removeTarget}
        title="Remove order?"
        message="All items from this restaurant will be removed from your cart."
        confirmLabel="Remove"
        cancelLabel="Keep"
        confirmVariant="danger"
        onConfirm={removeRestaurant}
        onCancel={() => setRemoveTarget(null)}
      />
      <BottomNav />
    </div>
  );
};

export default Cart;
