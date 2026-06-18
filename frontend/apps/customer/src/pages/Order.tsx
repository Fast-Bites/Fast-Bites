import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrderSummary, confirmOrderCheckout, type OrderTabItem, type TrackingStep } from '../lib/ordersApi';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import OverlayChoiceModal from '../components/OverlayChoiceModal';
import ServingBreakdownPanel, { ItemNameWithServingSuffix } from '../components/ServingBreakdownPanel';
import TabSwitcher from '../components/TabSwitcher';
import { hasMultiServingBreakdown, parseMultiServingBreakdown } from '../lib/servingBreakdown';
import { responsivePx } from '../constants/responsive';

/* ── Types ─────────────────────────────────────────── */
const DEFAULT_DELIVERY_FEE = 1500;

const TABS = [
  { id: 'order', label: 'Order' },
  { id: 'ongoing', label: 'Ongoing' },
];

/* ── Component ─────────────────────────────────────── */
const Order: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('order');
  const [items, setItems] = useState<OrderTabItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_DELIVERY_FEE);
  const [trackingDeliveryTime, setTrackingDeliveryTime] = useState('20 mins');
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);
  const [hasOngoing, setHasOngoing] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [checkoutCompleteOpen, setCheckoutCompleteOpen] = useState(false);
  /** Ongoing tab: tracking timeline shown only after the summary card is tapped */
  const [ongoingTrackingOpen, setOngoingTrackingOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    const { items: rows, deliveryFee: fee, ongoing, pendingOrderId: pendingId } = await fetchOrderSummary();
    setItems(rows);
    setDeliveryFee(fee);
    setPendingOrderId(pendingId);
    if (ongoing) {
      setHasOngoing(true);
      setTrackingDeliveryTime(ongoing.deliveryTime);
      setTrackingSteps(ongoing.steps);
    } else {
      setHasOngoing(false);
      setTrackingSteps([]);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (activeTab !== 'ongoing' || !hasOngoing) return;
    const interval = window.setInterval(() => {
      void loadOrders();
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [activeTab, hasOngoing, loadOrders]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const orderItemCount = items.reduce((s, i) => s + i.quantity, 0);
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (checkoutBusy || !pendingOrderId) return;
    setCheckoutError(null);
    setCheckoutBusy(true);
    const result = await confirmOrderCheckout(pendingOrderId);
    setCheckoutBusy(false);
    if (!result.ok) {
      setCheckoutError(result.error ?? 'Could not complete checkout. Please try again.');
      return;
    }
    await loadOrders();
    setCheckoutCompleteOpen(true);
  };

  const deleteItem = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const toggleExpand = (id: string) =>
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  /* Group items by restaurant */
  const groupedByRestaurant = items.reduce<Record<string, OrderTabItem[]>>((acc, item) => {
    if (!acc[item.restaurant]) acc[item.restaurant] = [];
    acc[item.restaurant].push(item);
    return acc;
  }, {});

  const renderItemCard = (item: OrderTabItem) => {
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
                    onClick={() => setDeleteTarget(item.id)}
                    aria-label="Delete item"
                    className="text-foreground hover:text-foreground"
                  >
                    <img src="/assets/delete-white-2.png" alt="" className="h-5 w-5 object-contain" />
                  </button>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              <p className="mt-1 text-primary font-regular text-lg">₦{item.price.toLocaleString()}</p>
            </div>
          </div>

          {breakdown && isOpen && <ServingBreakdownPanel breakdown={breakdown} />}
        </div>

        {breakdown && (
          <button
            type="button"
            onClick={() => toggleExpand(item.id)}
            className="flex w-full items-center justify-center gap-2 text-xs py-1.5 rounded-b-xl bg-primary text-primary-foreground"
          >
            {isOpen ? 'See less' : 'See more'}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  };

  const firstItem = items[0];

  const ongoingRestaurantLogo =
    firstItem && firstItem.restaurant === 'Chicken Republic'
      ? '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png'
      : firstItem?.image ?? '';

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== 'ongoing') setOngoingTrackingOpen(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-background font-[var(--font-poppins)]">
      {/* Header — same map+title BackButton used in Cart */}
      <div className={`absolute top-0 left-0 right-0 z-[50] ${responsivePx} pt-10`}>
        <BackButton variant="map" title="Order" />
      </div>
      <div className="h-27" />

      <div
        className={`${responsivePx} ${
          activeTab === 'order' && items.length > 0
            ? 'pb-[calc(15rem+env(safe-area-inset-bottom,0px))]'
            : 'pb-10'
        }`}
      >
        {/* Tabs */}
        <TabSwitcher tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        {/* ── Order Tab ──────────────────────────── */}
        {activeTab === 'order' && (
          <div className="mt-6">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">No items in your order</div>
            ) : (
              <>
                {Object.entries(groupedByRestaurant).map(([restaurant, restaurantItems]) => (
                  <div key={restaurant} className="mb-6">
                    <p className="mb-5 border-b border-primary-foreground/30 pb-1 text-sm text-muted-foreground">
                      {restaurant}
                    </p>
                    {restaurantItems.map((item) => renderItemCard(item))}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Ongoing / Tracking Tab ─────────────── */}
        {activeTab === 'ongoing' && (
          <div className="mt-6">
            {!hasOngoing ? (
              <div className="text-center text-muted-foreground py-16">No ongoing orders</div>
            ) : (
              <>
                <div className="mb-4 rounded-xl bg-overlay-panel-background px-2 py-4">
                  {/* Cart list-style header — tap row to show/hide tracking (no Show items / Checkout / Remove) */}
                  <button
                    type="button"
                    className="w-full rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => setOngoingTrackingOpen((o) => !o)}
                    aria-expanded={ongoingTrackingOpen}
                  >
                    <div className="flex w-full min-w-0 items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                        <img
                          src={ongoingRestaurantLogo}
                          alt={firstItem?.restaurant ?? 'Restaurant'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h2 className="min-w-0 truncate text-base font-semibold text-foreground">
                          {firstItem?.restaurant ?? 'Ongoing order'}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {orderItemCount} Items | ₦{subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <span className="text-[11px] leading-tight text-muted-foreground/75">
                        Tap here for live tracking
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-primary transition-transform duration-200 ${
                          ongoingTrackingOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                    </div>
                  </button>
                </div>

                {ongoingTrackingOpen && (
                  <div className="-mx-4 mb-4 bg-black px-4 py-6 min-[574px]:-mx-6 min-[574px]:px-6">
                    <p className="text-sm text-muted-foreground/80 ml-3">Delivery time</p>
                    <p className="text-xl font-bold text-foreground ml-3">{trackingDeliveryTime}</p>

                    <ol className="relative mt-6">
                      <span aria-hidden className="absolute left-[11px] -top-3 h-3 w-0.5 bg-primary" />
                      {trackingSteps.map((step, idx) => {
                        const isLast = idx === trackingSteps.length - 1;
                        return (
                          <li key={step.label} className="relative pb-6 pl-9">
                            {!isLast && (
                              <span aria-hidden className="absolute bottom-0 left-[11px] top-6 w-0.5 bg-primary" />
                            )}
                            <span
                              className={`absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-sm ${
                                step.completed ? 'bg-primary' : 'border border-white/80'
                              }`}
                            >
                              {step.completed && (
                                <svg viewBox="0 0 12 12" fill="none" className="h-4 w-4 text-primary-foreground">
                                  <path
                                    d="M2 6L5 9L10 3"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                    </span>
                            {isLast && (
                              <span aria-hidden className="absolute left-[11px] top-6 h-3 w-0.5 bg-primary" />
                            )}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className={`text-base ${step.completed ? 'text-primary' : 'text-foreground'}`}>
                                  {step.label}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground/80">{step.description}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="whitespace-nowrap text-xs text-muted-foreground/80">{step.time}</span>
                                {step.showView && (
                                  <button
                                    type="button"
                                    className="items-center justify-center rounded-full bg-white/70 px-3 py-0.5 text-xs text-foreground"
                                  >
                                    View
                                  </button>
                                )}
                  </div>
                  </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Order Summary — fixed bottom, full width (no horizontal inset); scroll area uses pb-* above */}
      {activeTab === 'order' && items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 rounded-t-4xl bg-overlay-panel-background px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Order Summary</h3>
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-muted-foreground">Sub total of items</span>
            <span className="text-muted-foreground">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="mb-3 flex justify-between text-xs">
            <span className="text-muted-foreground">Delivery fee</span>
            <span className="text-muted-foreground">₦{deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-white/40 pt-3">
            <span className="text-xs font-semibold text-foreground">Total</span>
            <span className="text-xs font-semibold text-foreground">₦{total.toLocaleString()}</span>
            </div>
          <div className="mt-6">
            {checkoutError && (
              <p className="mb-3 text-center text-sm text-red-400">{checkoutError}</p>
            )}
            <Button
              onClick={handleCheckout}
              variant="primary"
              disabled={checkoutBusy || !pendingOrderId}
            >
              {checkoutBusy ? 'Please wait…' : 'Checkout'}
            </Button>
          </div>
        </div>
      )}

      <OverlayChoiceModal
        open={checkoutCompleteOpen}
        onBackdropClick={() => setCheckoutCompleteOpen(false)}
        imageSrc="/assets/complete%20order%20mark.svg"
        imageAlt=""
        title="Congratulations"
        titleClassName="text-2xl font-bold"
        message={
          <p className="text-sm leading-relaxed text-foreground/70">
            You successfully Completed your order
            <br />
            Enjoy your service
          </p>
        }
        panelClassName="mx-4 w-full max-w-sm px-4 py-8"
        footer={
          <>
            <Button
              variant="appGreen"
              className="!py-3 !text-base"
              onClick={() => {
                setCheckoutCompleteOpen(false);
                setOngoingTrackingOpen(false);
                setActiveTab('ongoing');
              }}
            >
              Track Order
            </Button>
            <Button
              variant="outlineAppGreen"
              className="!py-3 !text-base"
              onClick={() => {
                setCheckoutCompleteOpen(false);
                navigate('/home');
              }}
            >
              Go to home
            </Button>
          </>
        }
      />

      <OverlayChoiceModal
        open={!!deleteTarget}
        onBackdropClick={() => setDeleteTarget(null)}
        title="Delete item?"
        actions={[
          { label: 'Yes', variant: 'green', onClick: deleteItem },
          { label: 'No', variant: 'primary', onClick: () => setDeleteTarget(null) },
        ]}
      />
    </div>
  );
};

export default Order;
