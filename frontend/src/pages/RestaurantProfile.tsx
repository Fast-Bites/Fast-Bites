import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Restaurant } from '../lib/api';
import BackButton from '../components/BackButton';
import ResendOverlay from '../components/ResendOverlay';
import { operatingHoursMessage } from '../constants/operatingHours';
import { responsivePx } from '../constants/responsive';
import { formatDeliveryTime } from '../lib/formatDeliveryTime';
import { isOpenForDisplay } from '../lib/restaurantDisplay';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  /** Minutes — displayed via formatDeliveryTime (same as Home) */
  deliveryMinutes: number;
}

const foodItems: MenuItem[] = [
  { id: '1', name: 'Jollof Rice & Chicken', price: 3500, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=200&fit=crop', deliveryMinutes: 25 },
  { id: '2', name: 'Fried Rice Special', price: 4000, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', deliveryMinutes: 30 },
  { id: '3', name: 'Grilled Chicken Platter', price: 5500, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop', deliveryMinutes: 35 },
  { id: '4', name: 'Peppered Snail', price: 6000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop', deliveryMinutes: 22 },
  { id: '5', name: 'Suya Meat', price: 3000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop', deliveryMinutes: 18 },
  { id: '6', name: 'Egusi Soup & Pounded Yam', price: 4500, image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop', deliveryMinutes: 80 },
];

const drinkItems: MenuItem[] = [
  { id: '7', name: 'Chapman', price: 1500, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop', deliveryMinutes: 8 },
  { id: '8', name: 'Zobo Drink', price: 800, image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300&h=200&fit=crop', deliveryMinutes: 5 },
  { id: '9', name: 'Fresh Orange Juice', price: 1200, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop', deliveryMinutes: 7 },
  { id: '10', name: 'Smoothie Bowl', price: 2000, image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=300&h=200&fit=crop', deliveryMinutes: 12 },
];

const RestaurantProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'food' | 'drinks'>('food');
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [showHoursOverlay, setShowHoursOverlay] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartMessage, setCartMessage] = useState<'added' | 'removed' | null>(null);
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

  const toggleMealSelection = (e: React.MouseEvent, mealId: string) => {
    e.stopPropagation();
    setSelectedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) {
        next.delete(mealId);
        showCartNotification('removed');
      } else {
        next.add(mealId);
        showCartNotification('added');
      }
      return next;
    });
  };

  const handleItemClick = (item: MenuItem) => {
    navigate(`/meal/${item.id}`, {
      state: {
        id: item.id,
        name: item.name,
        restaurant: restaurant.name,
        time: formatDeliveryTime(item.deliveryMinutes),
        price: `₦${item.price.toLocaleString()}`,
        image: item.image,
        rating: 4,
      }
    });
  };

  const currentItems = activeTab === 'food' ? foodItems : drinkItems;
  const isOpen = isOpenForDisplay(String(restaurant.id));

  const toggleOperatingHours = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowHoursOverlay((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Cover — back only on image; details live with Menu below */}
      <div className="relative h-56">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'}
          alt={restaurant.name}
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
                <img
                  src="/assets/Chicken republic.png"
                  alt="logo of restaurant"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 max-w-full flex flex-col justify-center text-left">
                <h1 className="truncate text-lg font-semibold text-foreground">
                  {restaurant.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-2 text-xs">
                  <img src="/assets/pin 3.svg" alt="" className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 max-w-full leading-snug text-muted-foreground">
                    {restaurant.address || 'Address not available'}
                  </span>
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span
                    className={`shrink-0 font-medium ${isOpen ? 'text-green-500' : 'text-red-500'}`}
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

        {/* Menu items — Home-style cards; time via formatDeliveryTime (single mins or hr + mins) */}
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
                    <span>{formatDeliveryTime(item.deliveryMinutes)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-foreground mt-2">
                      ₦{item.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleMealSelection(e, item.id)}
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
        message={operatingHoursMessage}
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
