import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import TabSwitcher from '../components/TabSwitcher';
import ConfirmDialog from '../components/ConfirmDialog';
import { responsivePx } from '../constants/responsive';

/* ── Types ─────────────────────────────────────────── */
interface OrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  restaurant: string;
}

interface OngoingOrder {
  id: string;
  restaurant: string;
  items: string[];
  total: number;
  status: 'preparing' | 'on the way' | 'arriving';
  eta: string;
}

/* ── Dummy data ────────────────────────────────────── */
const DUMMY_ORDER_ITEMS: OrderItem[] = [
  {
    id: 'i1',
    name: 'Rice',
    description: 'Properly cooked plain local rice',
    price: 5000,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    restaurant: 'Chicken Republic',
  },
  {
    id: 'i2',
    name: 'Blueberry Pancake',
    description: 'Fluffy cream filled blueberry pancake',
    price: 1500,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    restaurant: "Domino's Pizza",
  },
];

const DUMMY_ONGOING: OngoingOrder[] = [
  {
    id: 'o1',
    restaurant: 'Chicken Republic',
    items: ['Rice x2', 'Stew x1'],
    total: 11500,
    status: 'preparing',
    eta: '25 mins',
  },
  {
    id: 'o2',
    restaurant: "Domino's Pizza",
    items: ['Blueberry Pancake x1'],
    total: 1500,
    status: 'on the way',
    eta: '10 mins',
  },
];

const DELIVERY_FEE = 1500;

const TABS = [
  { id: 'order', label: 'Order' },
  { id: 'ongoing', label: 'Ongoing' },
];

/* ── Component ─────────────────────────────────────── */
const Order: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('order');
  const [items, setItems] = useState<OrderItem[]>(DUMMY_ORDER_ITEMS);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showSeeMore, setShowSeeMore] = useState<Record<string, boolean>>({});

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  const deleteItem = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const handleCheckout = () => {
    navigate('/order-complete');
  };

  /* Group items by restaurant */
  const groupedByRestaurant = items.reduce<Record<string, OrderItem[]>>((acc, item) => {
    if (!acc[item.restaurant]) acc[item.restaurant] = [];
    acc[item.restaurant].push(item);
    return acc;
  }, {});

  const statusColor = (status: OngoingOrder['status']) => {
    switch (status) {
      case 'preparing': return 'text-primary';
      case 'on the way': return 'text-app-green';
      case 'arriving': return 'text-app-green';
    }
  };

  return (
    <div className="w-full min-h-screen bg-background font-[var(--font-poppins)]">
      <PageHeader title="Order" />
      <div className="h-20" />

      <div className={`${responsivePx} pb-28`}>
        {/* Tabs — reusable TabSwitcher */}
        <TabSwitcher tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Order Tab ──────────────────────────── */}
        {activeTab === 'order' && (
          <div className="mt-6">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">No items in your order</div>
            ) : (
              <>
                {Object.entries(groupedByRestaurant).map(([restaurant, restaurantItems]) => (
                  <div key={restaurant} className="mb-6">
                    {/* Restaurant name */}
                    <p className="text-muted-foreground text-sm mb-3 border-b border-muted/20 pb-2">
                      {restaurant}
                    </p>

                    {/* Items */}
                    {restaurantItems.map((item) => (
                      <div key={item.id} className="mb-3">
                        <div className="flex gap-3 bg-overlay-panel-background rounded-xl overflow-hidden">
                          {/* Image */}
                          <div className="w-28 h-24 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          {/* Details */}
                          <div className="flex-1 py-3 pr-3 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <h3 className="text-foreground font-bold text-base">
                                  {item.name}
                                  {item.quantity > 1 && (
                                    <span className="text-primary font-bold"> (+{item.quantity - 1})</span>
                                  )}
                                </h3>
                                <p className="text-muted-foreground text-xs mt-0.5 truncate">{item.description}</p>
                              </div>
                              <button
                                onClick={() => setDeleteTarget(item.id)}
                                className="ml-2 flex-shrink-0 p-1"
                              >
                                <img src="/assets/delete.svg" alt="Delete" className="w-5 h-5 opacity-70" />
                              </button>
                            </div>
                            <p className="text-primary font-bold text-base mt-2">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* See more toggle */}
                        {item.quantity > 1 && (
                          <button
                            onClick={() => setShowSeeMore((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="w-full mt-1 py-1.5 rounded-b-xl bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1"
                          >
                            <span>{showSeeMore[item.id] ? 'See less' : 'See more'}</span>
                            <img
                              src="/assets/down-arrow.svg"
                              alt=""
                              className={`w-3 h-3 transition-transform ${showSeeMore[item.id] ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}

                        {/* Expanded items */}
                        {showSeeMore[item.id] && item.quantity > 1 && (
                          <div className="mt-1 bg-overlay-panel-background rounded-xl p-3 animate-fade-in">
                            {Array.from({ length: item.quantity }).map((_, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1">
                                <span className="text-muted-foreground">{item.name} #{idx + 1}</span>
                                <span className="text-foreground font-medium">₦{item.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Order Summary */}
                <div className="mt-8 bg-overlay-panel-background rounded-2xl p-5">
                  <h3 className="text-foreground font-bold text-base italic mb-4">Order Summary</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Sub total of items</span>
                    <span className="text-foreground">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span className="text-foreground">₦{DELIVERY_FEE.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-muted/20 pt-3 flex justify-between">
                    <span className="text-foreground font-bold text-sm">Total</span>
                    <span className="text-primary font-bold text-sm">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg transition-opacity hover:opacity-90 active:opacity-80"
                >
                  Checkout
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Ongoing Tab ────────────────────────── */}
        {activeTab === 'ongoing' && (
          <div className="mt-6">
            {DUMMY_ONGOING.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">No ongoing orders</div>
            ) : (
              DUMMY_ONGOING.map((order) => (
                <div key={order.id} className="bg-overlay-panel-background rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-foreground font-semibold text-base">{order.restaurant}</h3>
                    <span className={`text-xs font-medium capitalize ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-muted-foreground text-sm">{item}</p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-muted/20 pt-3">
                    <span className="text-muted-foreground text-xs">ETA: {order.eta}</span>
                    <span className="text-foreground font-bold text-sm">₦{order.total.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {/* future: track order */}}
                    className="w-full mt-3 py-3 rounded-full bg-app-green text-background font-semibold text-sm transition-opacity hover:opacity-90"
                  >
                    Track Order
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete item?"
        message="Are you sure you want to remove this item from your order?"
        confirmLabel="Delete"
        cancelLabel="Keep"
        confirmVariant="danger"
        onConfirm={deleteItem}
        onCancel={() => setDeleteTarget(null)}
      />
      <BottomNav />
    </div>
  );
};

export default Order;
