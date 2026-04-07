import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { responsivePx } from '../constants/responsive';
import Button from '../components/Button';
import BackButton from '../components/BackButton';


interface MealData {
  id: string;
  name: string;
  restaurant: string;
  time: string;
  price: string;
  image: string;
  rating?: number;
  description?: string;
}

interface Serving {
  sauce: string;
  extras: string;
  sauceOpen: boolean;
  extrasOpen: boolean;
}

const sizeOptions = ['Small', 'Medium', 'Large'];
const sauceOptions = ['Stew', 'Vegetable sauce', 'Chicken sauce'];
const extrasOptions = ['Extra cheese', 'Plantain', 'Coleslaw'];

function optionPriceNaira(label: string, mealId: string, kind: 'sauce' | 'extra'): number {
  let h = 0;
  const str = `${kind}|${mealId}|${label}`;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33 + str.charCodeAt(i)) >>> 0;
  }
  if (kind === 'sauce') return 200 + (h % 501);
  return 150 + (h % 451);
}

function parseMealState(state: unknown): MealData | null {
  if (!state || typeof state !== 'object') return null;
  if ('meal' in state && state.meal && typeof state.meal === 'object') {
    return state.meal as MealData;
  }
  return state as MealData;
}

const MealDetails: React.FC = () => {
  const location = useLocation();
  const { restaurantId } = useParams<{ restaurantId?: string; mealId?: string }>();

  const meal = useMemo(() => parseMealState(location.state), [location.state]);
  const fromRestaurantContext = Boolean(restaurantId);

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedSize, setSelectedSize] = useState('Small');
  const [addedToCart, setAddedToCart] = useState(false);

  // Multi-serving state for restaurant flow
  const [servings, setServings] = useState<Serving[]>([
    { sauce: '', extras: '', sauceOpen: false, extrasOpen: false },
  ]);
  const [deleteTargetIdx, setDeleteTargetIdx] = useState<number | null>(null);

  // Bottom sheet state
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    dragCurrentY.current = e.touches[0].clientY;
  }, []);

  const collapseSheet = useCallback(() => {
    setSheetExpanded(false);
    setServings((prev) => prev.map((s) => ({ ...s, sauceOpen: false, extrasOpen: false })));
  }, []);

  const expandSheet = useCallback(() => setSheetExpanded(true), []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = dragStartY.current - dragCurrentY.current;
    if (diff > 50) expandSheet();
    else if (diff < -50) collapseSheet();
  }, [expandSheet, collapseSheet]);

  const mealIdForPricing = meal?.id ?? '';

  const saucePriceMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of sauceOptions) m[s] = optionPriceNaira(s, mealIdForPricing, 'sauce');
    return m;
  }, [mealIdForPricing]);

  const extrasPriceMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of extrasOptions) m[e] = optionPriceNaira(e, mealIdForPricing, 'extra');
    return m;
  }, [mealIdForPricing]);

  // Serving helpers
  const updateServing = (idx: number, patch: Partial<Serving>) => {
    setServings((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const closeAllDropdowns = (exceptIdx?: number, exceptField?: 'sauce' | 'extras') => {
    setServings((prev) =>
      prev.map((s, i) => {
        if (i === exceptIdx) {
          return {
            ...s,
            sauceOpen: exceptField === 'sauce' ? s.sauceOpen : false,
            extrasOpen: exceptField === 'extras' ? s.extrasOpen : false,
          };
        }
        return { ...s, sauceOpen: false, extrasOpen: false };
      })
    );
  };

  const addServing = () => {
    setServings((prev) => [...prev, { sauce: '', extras: '', sauceOpen: false, extrasOpen: false }]);
  };

  const confirmDeleteServing = () => {
    if (deleteTargetIdx !== null && deleteTargetIdx > 0) {
      setServings((prev) => prev.filter((_, i) => i !== deleteTargetIdx));
    }
    setDeleteTargetIdx(null);
  };

  if (!meal) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Meal not found</p>
      </div>
    );
  }

  const basePrice = parseFloat(meal.price.replace(/[₦,]/g, ''));

  // Calculate total across all servings
  const servingsCost = fromRestaurantContext
    ? servings.reduce((sum, s) => {
        const sc = s.sauce ? saucePriceMap[s.sauce] ?? 0 : 0;
        const ec = s.extras ? extrasPriceMap[s.extras] ?? 0 : 0;
        return sum + sc + ec;
      }, 0)
    : 0;
  const totalPrice = basePrice * quantity + servingsCost;

  const description =
    meal.description ||
    'Crafted with a stone-baked crust, rich herb-infused sauce and a generous layer of melted cheese. Our pizza is loaded with fresh, high-quality toppings that deliver a rich and unforgettable flavor experience.';

  const anyDropdownOpen = servings.some((s) => s.sauceOpen || s.extrasOpen);

  // Render a single serving's sauce + extras dropdowns
  const renderServing = (serving: Serving, idx: number) => {
    const saucePrice = serving.sauce ? saucePriceMap[serving.sauce] ?? 0 : 0;
    const extrasPrice = serving.extras ? extrasPriceMap[serving.extras] ?? 0 : 0;
    const isExtra = idx > 0;

    return (
      <div key={idx} className={isExtra ? 'mt-4 pt-4 border-t border-muted-foreground/20' : ''}>
        {/* Section header for additional servings */}
        {isExtra && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">
              {idx === 1 ? 'Second' : idx === 2 ? 'Third' : `${idx + 1}th`} Serving:
            </span>
            <img
              src="/assets/down-arrow.svg"
              alt=""
              className="h-4 w-4 opacity-60"
            />
          </div>
        )}

        {/* Sauce dropdown */}
        <div className="mb-2">
          <h3 className="text-foreground text-lg font-light mb-2">Choose a sauce (required):</h3>
          <div className={`relative ${serving.sauceOpen ? 'z-40' : 'z-0'}`}>
            <button
              type="button"
              tabIndex={sheetExpanded ? 0 : -1}
              onClick={() => {
                if (!sheetExpanded) return;
                closeAllDropdowns(idx, 'sauce');
                updateServing(idx, { sauceOpen: !serving.sauceOpen, extrasOpen: false });
              }}
              className="relative z-10 flex w-full items-center justify-between rounded-lg border border-muted-foreground/40 bg-background p-3 text-sm"
            >
              <span className={serving.sauce ? 'text-foreground' : 'text-muted-foreground/50'}>
                {serving.sauce || 'Select a sauce'}
              </span>
              <img
                src="/assets/down-arrow.svg"
                alt=""
                className={`h-4 w-4 transition-transform ${serving.sauceOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {serving.sauceOpen && sheetExpanded && (
              <div
                className="absolute left-0 right-0 top-full z-50 flex flex-col gap-7 rounded-lg border border-muted-foreground/40 bg-background py-7 pl-3 pr-3 shadow-lg"
                role="listbox"
              >
                {sauceOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    onClick={() => updateServing(idx, { sauce: s, sauceOpen: false })}
                    className="flex w-full items-center justify-between gap-3 bg-transparent text-left text-sm text-foreground transition-opacity hover:opacity-80"
                  >
                    <span>{s}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">₦{saucePriceMap[s].toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className={`mt-1 text-right text-xs ${serving.sauce ? 'font-medium text-app-green' : 'text-muted-foreground'}`}>
            Cost: ₦{saucePrice.toLocaleString()}
          </p>
        </div>

        {/* Extras dropdown */}
        <div className="mb-2">
          <h3 className="text-foreground text-lg font-light mb-2">Extras (Optional):</h3>
          <div className={`relative ${serving.extrasOpen ? 'z-40' : 'z-0'}`}>
            <button
              type="button"
              tabIndex={sheetExpanded ? 0 : -1}
              onClick={() => {
                if (!sheetExpanded) return;
                closeAllDropdowns(idx, 'extras');
                updateServing(idx, { extrasOpen: !serving.extrasOpen, sauceOpen: false });
              }}
              className="relative z-10 flex w-full items-center justify-between rounded-lg border border-muted-foreground/40 bg-background p-3 text-sm"
            >
              <span className={serving.extras ? 'text-foreground' : 'text-muted-foreground/50'}>
                {serving.extras || 'Select your extras'}
              </span>
              <img
                src="/assets/down-arrow.svg"
                alt=""
                className={`h-4 w-4 transition-transform ${serving.extrasOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {serving.extrasOpen && sheetExpanded && (
              <div
                className="absolute left-0 right-0 top-full z-50 flex flex-col gap-7 rounded-lg border border-muted-foreground/40 bg-background py-7 pl-3 pr-3 shadow-lg"
                role="listbox"
              >
                {extrasOptions.map((e) => (
                  <button
                    key={e}
                    type="button"
                    role="option"
                    onClick={() => updateServing(idx, { extras: e, extrasOpen: false })}
                    className="flex w-full items-center justify-between gap-3 bg-transparent text-left text-sm text-foreground transition-opacity hover:opacity-80"
                  >
                    <span>{e}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">₦{extrasPriceMap[e].toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className={`mt-1 text-right text-xs ${serving.extras ? 'font-medium text-app-green' : 'text-muted-foreground'}`}>
            Cost: ₦{extrasPrice.toLocaleString()}
          </p>
        </div>

        {/* Remove button for additional servings */}
        {isExtra && (
          <button
            type="button"
            onClick={() => setDeleteTargetIdx(idx)}
            className="mt-1 flex items-center gap-2 rounded-lg bg-primary p-3 text-sm font-medium text-primary-foreground"
          >
            <img src="/assets/delete - white 1.svg" alt="Delete" className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-background font-[var(--font-poppins)] flex flex-col overflow-hidden relative">
      {/* Food Image with backdrop gradient */}
      <div className="relative w-full flex-1 min-h-0">
        <img
          src={meal.image}
          alt={meal.name}
          className="w-120 h-120 object-cover min-[450px]:w-[50rem] min-[450px]:h-[50rem] min-[450px]:object-cover"
        />
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      </div>

      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-[50] ${responsivePx} pt-10`}>
        <BackButton
          variant="map"
          title="Details"
          {...(fromRestaurantContext ? {} : { to: '/home' })}
        />
      </div>

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`absolute left-0 right-0 bg-background rounded-t-4xl transition-all duration-300 ease-out flex flex-col ${
          sheetExpanded ? 'top-[15%] bottom-0' : 'top-[55%] bottom-0'
        }`}
        style={{ zIndex: 20 }}
      >
        {/* Drag Handle + Price Bar */}
        <div className="flex flex-col flex-1 min-h-0 text-foreground bg-primary rounded-t-4xl">
          <div
            className="flex-shrink-0 cursor-grab"
            onClick={() => (sheetExpanded ? collapseSheet() : expandSheet())}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex justify-center pt-3">
              <div className="w-24 h-2 bg-background rounded-full" />
            </div>
            <div className={`${responsivePx} py-3 flex items-center justify-between`}>
              <span className="text-primary-foreground/90 text-sm">Total price</span>
              <span className="text-primary-foreground text-xl font-bold">₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Sheet content */}
          <div
            className={`flex-1 min-h-0 ${responsivePx} bg-background rounded-t-4xl ${
              fromRestaurantContext && !sheetExpanded
                ? 'overflow-y-hidden'
                : anyDropdownOpen
                  ? 'overflow-visible'
                  : 'overflow-y-auto'
            }`}
          >
            {/* Meal info card */}
            <div className="flex items-start justify-between mb-1 pt-4">
              <div className="flex-1">
                <h2 className="text-foreground text-2xl font-medium">{meal.name}</h2>
                <p className="text-muted-foreground text-xs truncate">
                  Restaurant: {meal.restaurant.replace('From ', '')}
                </p>
                <div className="flex items-center gap-1 my-1 text-xs text-muted-foreground">
                  <img src="/assets/stopwatch 1-home.png" alt="Time" className="w-4 h-4" />
                  <span>{meal.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-foreground rounded-full px-3 py-3">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-6 h-6 flex items-center justify-center">
                  <img src="/assets/Minus.png" alt="Decrease" className="w-4 h-4" />
                </button>
                <span className="text-background font-bold w-4 text-center">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-6 h-6 flex items-center justify-center">
                  <img src="/assets/Plus.png" alt="Increase" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex gap-0.5 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill={star <= (meal.rating || 4) ? '#FFD700' : 'none'} stroke="#FFD700" strokeWidth="2">
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              ))}
            </div>

            {fromRestaurantContext ? (
              <div
                className={!sheetExpanded ? 'pointer-events-none select-none opacity-50' : undefined}
                aria-hidden={!sheetExpanded}
              >
                {/* Render all servings */}
                {servings.map((serving, idx) => renderServing(serving, idx))}

                {/* Add another serving button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!sheetExpanded) return;
                    addServing();
                  }}
                  tabIndex={sheetExpanded ? 0 : -1}
                  className="mt-4 mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-transparent py-3 text-sm font-medium text-primary transition-opacity hover:opacity-80"
                >
                  <img src="/assets/more serving.svg" alt="" className="h-5 w-5" />
                  Add another serving
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <h3 className="text-foreground text-lg font-light mb-2">Size Options:</h3>
                <div className="flex gap-3">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-2 rounded-full text-xs font-light transition-all ${
                        selectedSize === size
                          ? 'bg-primary border border-primary text-primary-foreground'
                          : 'bg-transparent border border-primary text-muted-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sheetExpanded && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h3 className="text-foreground text-lg font-light mb-2">Description</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-foreground text-lg font-light mb-2">Note</h3>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Input special requests, allergies etc."
                    className="w-full h-28 bg-muted/35 rounded-xl p-3 text-foreground text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className={`${responsivePx} pb-6 pt-3 flex gap-3 flex-shrink-0`}>
          <Button
            variant="primary"
            className={`flex-1 ${addedToCart ? '!bg-transparent border-2 border-primary !text-primary' : ''}`}
            onClick={() => setAddedToCart(!addedToCart)}
          >
            Add to Cart
          </Button>
          <Button variant="accent" className="flex-1">
            Order now
          </Button>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {deleteTargetIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteTargetIdx(null)}>
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          <div
            className="relative z-10 flex flex-col items-center gap-4 rounded-xl border border-white/15 bg-overlay-panel-background px-5 py-4 shadow-lg backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-foreground text-base font-medium">Delete serving?</p>
            <div className="flex w-full min-w-[200px] gap-12">
              <button
                type="button"
                onClick={confirmDeleteServing}
                className="flex-1 rounded-md bg-app-green py-2 text-center text-sm font-semibold text-black transition-opacity hover:opacity-80"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetIdx(null)}
                className="flex-1 rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-80"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealDetails;
