import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { addCartItem } from '../lib/cartApi';
import {
  buildOptionsJson,
  buildSizeOptionsJson,
  cartItemNameForServings,
  fetchMealModifiers,
  type ModifierOption,
} from '../lib/menuModifiersApi';
import { createOrderFromCart } from '../lib/ordersApi';
import { responsivePx } from '../constants/responsive';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import OverlayChoiceModal from '../components/OverlayChoiceModal';

/** Scrollable modifier list — opens over content; max height keeps options reachable. */
const MODIFIER_DROPDOWN_PANEL =
  'absolute left-0 right-0 z-50 flex max-h-44 flex-col gap-2 overflow-y-auto overscroll-y-contain rounded-lg border border-muted-foreground/40 bg-background py-3 pl-3 pr-3 shadow-lg touch-manipulation';

interface MealData {
  id: string;
  name: string;
  restaurant: string;
  restaurant_id?: string;
  time: string;
  price: string;
  image: string;
  rating?: number;
  description?: string;
}

interface Serving {
  sauceId: string;
  sauceLabel: string;
  extrasId: string;
  extrasLabel: string;
  sauceOpen: boolean;
  extrasOpen: boolean;
}

const emptyServing = (): Serving => ({
  sauceId: '',
  sauceLabel: '',
  extrasId: '',
  extrasLabel: '',
  sauceOpen: false,
  extrasOpen: false,
});

const SIZE_LABELS = ['Small', 'Medium', 'Large'] as const;

function parseMealState(state: unknown): MealData | null {
  if (!state || typeof state !== 'object') return null;
  if ('meal' in state && state.meal && typeof state.meal === 'object') {
    return state.meal as MealData;
  }
  return state as MealData;
}

const MealDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { restaurantId, mealId, id: homeMealId } = useParams<{
    restaurantId?: string;
    mealId?: string;
    id?: string;
  }>();

  const meal = useMemo(() => parseMealState(location.state), [location.state]);
  const fromRestaurantContext = Boolean(restaurantId);
  const mealItemId = mealId ?? homeMealId ?? meal?.id;

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [orderBusy, setOrderBusy] = useState(false);

  const [sauceOptions, setSauceOptions] = useState<ModifierOption[]>([]);
  const [extrasOptions, setExtrasOptions] = useState<ModifierOption[]>([]);
  const [sizeOptions, setSizeOptions] = useState<ModifierOption[]>([]);
  const [modifiersNote, setModifiersNote] = useState<string | null>(null);
  const [modifiersLoading, setModifiersLoading] = useState(false);

  const [servings, setServings] = useState<Serving[]>([emptyServing()]);
  const [deleteTargetIdx, setDeleteTargetIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!mealItemId) return;
    setModifiersLoading(true);
    fetchMealModifiers(mealItemId).then(
      ({ sauceOptions: sauces, extrasOptions: extras, sizeOptions: sizes, modifiersNote: note }) => {
        if (fromRestaurantContext) {
          setSauceOptions(sauces);
          setExtrasOptions(extras);
          setModifiersNote(note);
        } else {
          setSauceOptions([]);
          setExtrasOptions([]);
          setModifiersNote(null);
          setSizeOptions(sizes);
        }
        setModifiersLoading(false);
      },
    );
  }, [fromRestaurantContext, mealItemId]);

  useEffect(() => {
    if (fromRestaurantContext || sizeOptions.length === 0) return;
    setSelectedSizeId((prev) => {
      if (prev && sizeOptions.some((o) => o.id === prev)) return prev;
      const medium = sizeOptions.find((o) => o.label.toLowerCase() === 'medium');
      return medium?.id ?? sizeOptions[0].id;
    });
  }, [fromRestaurantContext, sizeOptions]);

  // Bottom sheet state
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetScrollRef = useRef<HTMLDivElement>(null);
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

  const saucePriceById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of sauceOptions) m[o.id] = o.price;
    return m;
  }, [sauceOptions]);

  const extrasPriceById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of extrasOptions) m[o.id] = o.price;
    return m;
  }, [extrasOptions]);

  const sizePriceById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of sizeOptions) m[o.id] = o.price;
    return m;
  }, [sizeOptions]);

  const sizeByLabel = useMemo(() => {
    const m = new Map<string, ModifierOption>();
    for (const o of sizeOptions) m.set(o.label.toLowerCase(), o);
    return m;
  }, [sizeOptions]);

  const selectedSizeOption = sizeOptions.find((o) => o.id === selectedSizeId);
  const sizePriceDelta = selectedSizeId ? sizePriceById[selectedSizeId] ?? 0 : 0;

  const sauceRequired = sauceOptions.length > 0;

  const preserveSheetScroll = (update: () => void) => {
    const el = sheetScrollRef.current;
    const scrollTop = el?.scrollTop ?? 0;
    update();
    requestAnimationFrame(() => {
      if (el) el.scrollTop = scrollTop;
      requestAnimationFrame(() => {
        if (el) el.scrollTop = scrollTop;
      });
    });
  };

  const applyModifierChoice = (
    idx: number,
    field: 'sauce' | 'extras',
    choice: ModifierOption | null,
  ) => {
    preserveSheetScroll(() => {
      setServings((prev) =>
        prev.map((s, i) => {
          if (i !== idx) return s;
          if (field === 'sauce') {
            return {
              ...s,
              sauceId: choice?.id ?? '',
              sauceLabel: choice?.label ?? '',
              sauceOpen: false,
            };
          }
          return {
            ...s,
            extrasId: choice?.id ?? '',
            extrasLabel: choice?.label ?? '',
            extrasOpen: false,
          };
        }),
      );
    });
  };

  // Serving helpers
  const updateServing = (idx: number, patch: Partial<Serving>) => {
    preserveSheetScroll(() => {
      setServings((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
    });
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
    setServings((prev) => [...prev, emptyServing()]);
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
        const sc = s.sauceId ? saucePriceById[s.sauceId] ?? 0 : 0;
        const ec = s.extrasId ? extrasPriceById[s.extrasId] ?? 0 : 0;
        return sum + sc + ec;
      }, 0)
    : 0;
  const homeUnitPrice = basePrice + sizePriceDelta;
  const totalPrice = fromRestaurantContext
    ? basePrice * quantity + servingsCost
    : homeUnitPrice * quantity;

  const addCurrentMealToCart = async (): Promise<{
    ok: boolean;
    restaurantId?: string;
    error?: string;
  }> => {
    if (fromRestaurantContext) {
      if (!restaurantId) return { ok: false, error: 'Restaurant not found.' };
      if (sauceRequired && servings.some((s) => !s.sauceId)) {
        return { ok: false, error: 'Please choose a sauce for each serving.' };
      }
      const lineUnitPrice =
        quantity > 0 ? (basePrice * quantity + servingsCost) / quantity : basePrice;
      const result = await addCartItem({
        restaurant_id: restaurantId,
        menu_item_id: meal.id,
        name: cartItemNameForServings(meal.name, servings.length),
        unit_price: lineUnitPrice,
        quantity,
        image_url: meal.image,
        section: 'main',
        options_json: buildOptionsJson(
          servings,
          saucePriceById,
          extrasPriceById,
          basePrice,
          meal.name,
        ),
        special_instructions: note.trim() || undefined,
      });
      if (!result.ok) {
        return { ok: false, error: result.error ?? 'Could not add to cart — sign in and try again.' };
      }
      return { ok: true, restaurantId };
    }

    const homeRestaurantId = meal.restaurant_id;
    if (!homeRestaurantId) {
      return { ok: false, error: 'Restaurant information is missing for this meal.' };
    }
    if (sizeOptions.length > 0 && !selectedSizeId) {
      return { ok: false, error: 'Please choose a size.' };
    }
    const result = await addCartItem({
      restaurant_id: homeRestaurantId,
      menu_item_id: meal.id,
      name: meal.name,
      unit_price: homeUnitPrice,
      quantity,
      image_url: meal.image,
      section: 'main',
      options_json: selectedSizeOption
        ? buildSizeOptionsJson(selectedSizeId, selectedSizeOption.label, sizePriceDelta)
        : {},
      special_instructions: note.trim() || undefined,
    });
    if (!result.ok) {
      return { ok: false, error: result.error ?? 'Could not add to cart — sign in and try again.' };
    }
    return { ok: true, restaurantId: homeRestaurantId };
  };

  const handleAddToCart = async () => {
    setCartError(null);
    const result = await addCurrentMealToCart();
    if (!result.ok) {
      setCartError(result.error ?? 'Could not add to cart.');
      return;
    }
    setAddedToCart(true);
  };

  const handleOrderNow = async () => {
    if (orderBusy) return;
    setCartError(null);
    setOrderBusy(true);
    const addResult = await addCurrentMealToCart();
    if (!addResult.ok) {
      setCartError(addResult.error ?? 'Could not add to cart.');
      setOrderBusy(false);
      return;
    }
    const orderResult = await createOrderFromCart(addResult.restaurantId!);
    setOrderBusy(false);
    if (!orderResult.ok) {
      setCartError(orderResult.error ?? 'Could not start your order. Please try again.');
      return;
    }
    navigate('/orders');
  };

  const description =
    meal.description ||
    'Crafted with a stone-baked crust, rich herb-infused sauce and a generous layer of melted cheese. Our pizza is loaded with fresh, high-quality toppings that deliver a rich and unforgettable flavor experience.';

  const modifierOptionPick = (
    e: React.PointerEvent,
    idx: number,
    field: 'sauce' | 'extras',
    choice: ModifierOption | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    applyModifierChoice(idx, field, choice);
  };

  // Render a single serving's sauce + extras dropdowns
  const renderServing = (serving: Serving, idx: number) => {
    const saucePrice = serving.sauceId ? saucePriceById[serving.sauceId] ?? 0 : 0;
    const extrasPrice = serving.extrasId ? extrasPriceById[serving.extrasId] ?? 0 : 0;
    const isExtra = idx > 0;
    /** Additional servings sit low in the sheet — open lists upward so options aren't clipped. */
    const sauceDropdownPosition = isExtra ? 'bottom-full mb-1' : 'top-full mt-1';
    const extrasDropdownPosition = 'bottom-full mb-1';

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
        {sauceOptions.length > 0 && (
        <div className="mb-2">
          <h3 className="text-foreground text-lg font-light mb-2">
            Choose a sauce{sauceRequired ? ' (required)' : ''}:
          </h3>
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
              <span className={serving.sauceLabel ? 'text-foreground' : 'text-muted-foreground/50'}>
                {serving.sauceLabel || 'Select a sauce'}
              </span>
              <img
                src="/assets/down-arrow.svg"
                alt=""
                className={`h-4 w-4 transition-transform ${serving.sauceOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {serving.sauceOpen && sheetExpanded && (
              <div
                className={`${MODIFIER_DROPDOWN_PANEL} ${sauceDropdownPosition}`}
                role="listbox"
              >
                <button
                  type="button"
                  role="option"
                  tabIndex={-1}
                  onPointerDown={(e) => modifierOptionPick(e, idx, 'sauce', null)}
                  className="w-full shrink-0 bg-transparent text-left text-sm text-muted-foreground transition-opacity hover:opacity-80"
                >
                  None
                </button>
                {sauceOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={serving.sauceId === opt.id}
                    onPointerDown={(e) =>
                      modifierOptionPick(
                        e,
                        idx,
                        'sauce',
                        serving.sauceId === opt.id ? null : opt,
                      )
                    }
                    className="w-full shrink-0 bg-transparent text-left text-sm text-foreground transition-opacity hover:opacity-80"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className={`mt-1 text-right text-xs ${serving.sauceLabel ? 'font-medium text-popup-green' : 'text-muted-foreground'}`}>
            {serving.sauceLabel ? `Cost: ₦${saucePrice.toLocaleString()}` : 'Cost: ₦0'}
          </p>
        </div>
        )}

        {/* Extras dropdown */}
        {extrasOptions.length > 0 && (
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
              <span className={serving.extrasLabel ? 'text-foreground' : 'text-muted-foreground/50'}>
                {serving.extrasLabel || 'Select your extras'}
              </span>
              <img
                src="/assets/down-arrow.svg"
                alt=""
                className={`h-4 w-4 transition-transform ${serving.extrasOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {serving.extrasOpen && sheetExpanded && (
              <div
                className={`${MODIFIER_DROPDOWN_PANEL} ${extrasDropdownPosition}`}
                role="listbox"
              >
                <button
                  type="button"
                  role="option"
                  tabIndex={-1}
                  onPointerDown={(e) => modifierOptionPick(e, idx, 'extras', null)}
                  className="w-full shrink-0 bg-transparent text-left text-sm text-muted-foreground transition-opacity hover:opacity-80"
                >
                  None
                </button>
                {extrasOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={serving.extrasId === opt.id}
                    onPointerDown={(e) =>
                      modifierOptionPick(
                        e,
                        idx,
                        'extras',
                        serving.extrasId === opt.id ? null : opt,
                      )
                    }
                    className="w-full shrink-0 bg-transparent text-left text-sm text-foreground transition-opacity hover:opacity-80"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className={`mt-1 text-right text-xs ${serving.extrasLabel ? 'font-medium text-popup-green' : 'text-muted-foreground'}`}>
            {serving.extrasLabel ? `Cost: ₦${extrasPrice.toLocaleString()}` : 'Cost: ₦0'}
          </p>
        </div>
        )}

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
            ref={sheetScrollRef}
            className={`flex-1 min-h-0 ${responsivePx} bg-background rounded-t-4xl ${
              fromRestaurantContext && !sheetExpanded
                ? 'overflow-y-hidden'
                : 'overflow-y-auto overscroll-y-contain'
            } ${sheetExpanded ? 'pb-6' : ''}`}
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
                {modifiersLoading && (
                  <p className="mb-4 text-sm text-muted-foreground">Loading options…</p>
                )}
                {!modifiersLoading && modifiersNote && (
                  <p className="mb-4 text-sm text-muted-foreground">{modifiersNote}</p>
                )}
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
                  {SIZE_LABELS.map((label) => {
                    const opt = sizeByLabel.get(label.toLowerCase());
                    const available = Boolean(opt) && !modifiersLoading;
                    const selected = available && selectedSizeId === opt?.id;
                    return (
                      <button
                        key={label}
                        type="button"
                        disabled={!available}
                        onClick={() => opt && setSelectedSizeId(opt.id)}
                        className={`flex-1 py-2 rounded-full text-xs font-light transition-all ${
                          !available
                            ? 'cursor-not-allowed border border-muted-foreground/35 bg-transparent text-muted-foreground'
                            : selected
                              ? 'bg-primary border border-primary text-primary-foreground'
                              : 'bg-transparent border border-primary text-muted-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
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

        {cartError && (
          <p className={`${responsivePx} text-sm text-red-400`}>{cartError}</p>
        )}

        {/* Bottom Buttons */}
        <div className={`${responsivePx} pb-6 pt-3 flex gap-3 flex-shrink-0`}>
          <Button
            variant="primary"
            className={`flex-1 ${addedToCart ? '!bg-transparent border-2 border-primary !text-primary' : ''}`}
            disabled={orderBusy}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button
            variant="accent"
            className="flex-1"
            disabled={orderBusy}
            onClick={handleOrderNow}
          >
            {orderBusy ? 'Please wait…' : 'Order now'}
          </Button>
        </div>
      </div>

      <OverlayChoiceModal
        open={deleteTargetIdx !== null}
        onBackdropClick={() => setDeleteTargetIdx(null)}
        title="Delete serving?"
        actions={[
          { label: 'Yes', variant: 'green', onClick: confirmDeleteServing },
          { label: 'No', variant: 'primary', onClick: () => setDeleteTargetIdx(null) },
        ]}
      />
    </div>
  );
};

export default MealDetails;
