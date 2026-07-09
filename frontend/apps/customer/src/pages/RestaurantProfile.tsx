import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { type Restaurant, type RestaurantMenuItemDto } from '../lib/api';
import {
  fetchCartMenuItemIds,
  quickAddToCart,
  removeMenuItemFromCart,
} from '../lib/cartApi';
import BackButton from '../components/BackButton';
import ResendOverlay from '../components/ResendOverlay';
import { responsivePx } from '../constants/responsive';
import { formatDeliveryTime } from '../lib/formatDeliveryTime';
import {
  restaurantIsOpen,
  restaurantOperatingHoursText,
} from '../lib/restaurantHours';
import { RestaurantCover, RestaurantLogo } from '../components/RestaurantMedia';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  deliveryMinutes?: number;
}

function mapMenuDto(row: RestaurantMenuItemDto): MenuItem {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
    deliveryMinutes: row.delivery_minutes ?? undefined,
  };
}

const RestaurantProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'food' | 'drinks'>('food');
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [showHoursOverlay, setShowHoursOverlay] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartMessage, setCartMessage] = useState<'added' | 'removed' | null>(null);
  const [foodItems, setFoodItems] = useState<MenuItem[]>([]);
  const [drinkItems, setDrinkItems] = useState<MenuItem[]>([]);
  const [menuNote, setMenuNote] = useState<string | null>(null);
  const [liveRestaurant, setLiveRestaurant] = useState<Restaurant | null>(null);
  const cartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
    };
  }, []);

  // Get restaurant data from navigation state
  const restaurant: Restaurant | undefined = location.state?.restaurant;

  useEffect(() => {
    if (!restaurant?.id) return;
    api.getRestaurant(String(restaurant.id)).then((res) => {
      if (res.data) setLiveRestaurant(res.data as Restaurant);
    });
    const loadMenu = async () => {
      const [foodRes, drinksRes] = await Promise.all([
        api.getRestaurantMenuByCategory(String(restaurant.id), 'food'),
        api.getRestaurantMenuByCategory(String(restaurant.id), 'drinks'),
      ]);
      if (foodRes.error && drinksRes.error) {
        setFoodItems([]);
        setDrinkItems([]);
        setMenuNote('Menu unavailable — connect to the API.');
        return;
      }
      setMenuNote(null);
      setFoodItems((foodRes.data ?? []).map(mapMenuDto));
      setDrinkItems((drinksRes.data ?? []).map(mapMenuDto));
      const cartIds = await fetchCartMenuItemIds();
      setSelectedMeals(cartIds);
    };
    loadMenu();
  }, [restaurant?.id]);

  // Fallback if no restaurant data passed
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Restaurant not found</p>
          <button
            onClick={() => navigate('/restaurants')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  const showCartNotification = (type: 'added' | 'removed') => {
    setCartMessage(type);
    if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
    cartTimerRef.current = setTimeout(() => setCartMessage(null), 2000);
  };

  const toggleMealSelection = async (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    const isSelected = selectedMeals.has(item.id);

    if (isSelected) {
      const result = await removeMenuItemFromCart(item.id);
      if (!result.ok) return;
      setSelectedMeals((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      showCartNotification('removed');
      return;
    }

    const result = await quickAddToCart({
      restaurant_id: String(restaurant.id),
      menu_item_id: item.id,
      name: item.name,
      unit_price: item.price,
      image_url: item.image,
    });
    if (!result.ok) return;
    setSelectedMeals((prev) => new Set(prev).add(item.id));
    showCartNotification('added');
  };

  const handleItemClick = (item: MenuItem) => {
    navigate(`/restaurant/${restaurant.id}/meal/${item.id}`, {
      state: {
        meal: {
          id: item.id,
          name: item.name,
          restaurant: restaurant.name,
          time: formatDeliveryTime(item.deliveryMinutes),
          price: `₦${item.price.toLocaleString()}`,
          image: item.image,
          rating: 4,
        },
        restaurant,
      },
    });
  };

  const displayRestaurant = liveRestaurant ?? restaurant;
  const currentItems = activeTab === 'food' ? foodItems : drinkItems;
  const isOpen = restaurantIsOpen(displayRestaurant);

  const toggleOperatingHours = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowHoursOverlay((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Cover — back only on image; details live with Menu below */}
      <div className="relative h-56">
        <RestaurantCover
          imageUrl={displayRestaurant.image_url}
          alt={displayRestaurant.name}
          className="h-full w-full object-cover"
        />
        <BackButton variant="map" className="absolute left-4 top-4 z-10" />
      </div>

      <div className={`${responsivePx} mt-4 pb-24`}>
        <div className="mb-6 rounded-2xl bg-card">
          {/* One centered row: logo + details share this flex group */}
          <div className="flex w-full items-center">
            <div className="flex max-w-full gap-2">
              <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-sm">
                <RestaurantLogo
                  logoUrl={displayRestaurant.logo_url}
                  alt={`${displayRestaurant.name} logo`}
                />
              </div>

              <div className="min-w-0 max-w-full flex flex-col justify-center text-left">
                <h1 className="truncate text-lg font-semibold text-foreground">
                  {displayRestaurant.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-2 text-xs">
                  <img src="/assets/pin 3.svg" alt="" className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 max-w-full leading-snug text-muted-foreground">
                    {displayRestaurant.address || 'Address not available'}
                  </span>
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      isOpen ? 'bg-popup-green' : 'bg-red-500'
                    }`}
                  />
                  <span
                    className={`shrink-0 font-medium ${isOpen ? 'text-popup-green' : 'text-red-500'}`}
                  >
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                  <button
                    type="button"
                    aria-label="Operating hours"
                    aria-expanded={showHoursOverlay}
                    onClick={toggleOperatingHours}
                    className="rounded-full p-1 text-muted-foreground hover:bg-muted/30"
                  >
                    <img src="/assets/info 1.svg" alt="info" className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Food/Drinks Tabs — glossy black glass */}
        <div className="h-12 mb-6 flex justify-between rounded-xl border border-white/20 bg-white/8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-lg">
          <button
            onClick={() => setActiveTab('food')}
            className={`w-full rounded-lg text-lg font-normal transition-colors ${
              activeTab === 'food'
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground'
            }`}
          >
            Food
          </button>
          <button
            onClick={() => setActiveTab('drinks')}
            className={`w-full rounded-lg text-lg font-normal transition-colors ${
              activeTab === 'drinks'
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground'
            }`}
          >
            Drinks
          </button>
        </div>

        {menuNote && (
          <p className="mb-4 text-sm text-muted-foreground">{menuNote}</p>
        )}

        {/* Menu items — Home-style cards; time via formatDeliveryTime (single mins or hr + mins) */}
        {currentItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {activeTab === 'food' ? 'No food at the moment.' : 'No drinks at the moment.'}
          </p>
        ) : (
        <div className="grid grid-cols-2 min-[500px]:grid-cols-3 min-[700px]:grid-cols-4 gap-2 space-y-2 pb-8">
          {currentItems.map((item) => {
            const isSelected = selectedMeals.has(item.id);
            return (
              <div
                key={item.id}
                className="cursor-pointer overflow-hidden rounded-xl backdrop-blur-lg transition-transform active:scale-95"
                style={{
                  backgroundColor: 'hsla(0, 0%, 10%, 0.8)',
                  border: '1px solid hsl(0, 0%, 20%)',
                }}
                onClick={() => handleItemClick(item)}
              >
                <div className="h-32 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="truncate text-base font-semibold text-foreground">{item.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <img
                      src="/assets/stopwatch 1-home.png"
                      alt="Time"
                      className="h-4 w-4"
                    />
                    <span>
                      {item.deliveryMinutes != null
                        ? formatDeliveryTime(item.deliveryMinutes)
                        : 'Time not set'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-foreground mt-2">
                      ₦{item.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleMealSelection(e, item)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                        isSelected
                          ? 'border-2 border-primary bg-transparent'
                          : 'bg-primary'
                      }`}
                    >
                      <img
                        src="/assets/plus 1-home.png"
                        alt="Add"
                        className="h-3 w-3"
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <div
        className={`fixed bottom-8 left-0 right-0 ${responsivePx} pointer-events-none z-40 flex h-12 items-center justify-center`}
      >
        {cartMessage && (
          <div
            className={`pointer-events-auto animate-fade-in rounded-lg px-4 py-2 shadow-lg ${
              cartMessage === 'added' ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span className="whitespace-nowrap text-xs font-medium text-foreground">
              {cartMessage === 'added' ? 'Added to cart' : 'Removed from cart'}
            </span>
          </div>
        )}

        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pointer-events-auto absolute right-4 min-[574px]:right-6"
          >
            <img src="/assets/Back to top.png" alt="Back to top" className="h-15 w-15" />
          </button>
        )}
      </div>

      <ResendOverlay
        visible={showHoursOverlay}
        message={restaurantOperatingHoursText(displayRestaurant)}
        onClose={() => setShowHoursOverlay(false)}
        type="warning"
        iconSrc="/assets/info 1.svg"
        title="Operating hours"
        align="left"
      />
    </div>
  );
};

export default RestaurantProfile;
