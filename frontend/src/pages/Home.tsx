import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { MenuItemWithRestaurant } from '../lib/api';
import { formatDeliveryTime } from '../lib/formatDeliveryTime';
import { responsivePx, responsivePt } from '../constants/responsive';
import SearchBar from '../components/SearchBar';
import BottomNav from '../components/BottomNav';
import MenuOverlay from '../components/MenuOverlay';

interface UserProfile {
  first_name?: string;
  last_name?: string;
  address?: string;
}

interface MealDisplay {
  id: string;
  name: string;
  restaurant: string;
  time: string;
  price: string;
  image: string;
}

/** Same avatar as header + menu overlay profile row */
const PROFILE_AVATAR_IMAGE = '/assets/stefan-stefancik-QXevDflbl8A-unsplash 1.png';

// Placeholder images for meals without images - randomly assigned
const PLACEHOLDER_IMAGES = [
  '/assets/chad-montano-MqT0asuoIcU-unsplash 2.png', // Pizza
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', // Pancakes
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', // Salad
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', // BBQ
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartMessage, setCartMessage] = useState<'added' | 'removed' | null>(null);
  const cartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user profile
      const { data: profileData } = await api.getProfile();
      if (profileData) {
        setUser(profileData as UserProfile);
      }

      // Fetch ALL menu items (default limit is 100)
      const { data: menuData } = await api.getMenuItems();
      if (menuData && menuData.length > 0) {
        const formattedMeals: MealDisplay[] = menuData.map((item: MenuItemWithRestaurant) => ({
          id: item.id,
          name: item.name,
          restaurant: item.restaurant_name ? `From ${item.restaurant_name}` : 'From Restaurant',
          time: formatDeliveryTime(item.delivery_time),
          price: `₦${item.price.toLocaleString()}`,
          // Use image_url from DB or random placeholder
          image: item.image_url || PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)],
        }));
        setMeals(formattedMeals);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Track scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'Shops', image: '/assets/shops.png' },
    { name: 'Pharmacy', image: '/assets/phamarcy.png' },
    { name: 'Local Market', image: '/assets/local market.png' },
  ];

  const showCartNotification = (type: 'added' | 'removed') => {
    setCartMessage(type);
    // Clear existing timer and set new one
    if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
    cartTimerRef.current = setTimeout(() => setCartMessage(null), 2000);
  };

  const toggleMealSelection = (mealId: string) => {
    setSelectedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
        showCartNotification('removed');
      } else {
        newSet.add(mealId);
        showCartNotification('added');
      }
      return newSet;
    });
  };

  return (
    <div className="w-full min-h-screen bg-background font-[var(--font-poppins)]">
      {/* 1st section - Header (Fixed) */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-background flex items-center justify-between ${responsivePx} ${responsivePt} pb-3`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={PROFILE_AVATAR_IMAGE}
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-foreground text-md">
              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Guest' : 'Loading...'}
            </h2>
            <p className="text-muted-foreground text-[10px] truncate max-w-[150px] min-[400px]:max-w-[200px] min-[574px]:max-w-[360px]">
              {user?.address || 'No address set'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
        >
          <img src="/assets/more 1.svg" alt="Menu" className="w-4 h-4" />
        </button>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* 2nd section - Search */}
      <div className={`${responsivePx} mt-4`}>
        <SearchBar />
      </div>

      {/* 3rd section - Categories */}
      <div className={`${responsivePx} mt-6`}>
        {/* Restaurants - Large Card */}
        <div 
          className="relative h-32 rounded-xl overflow-hidden mb-3 cursor-pointer transition-transform active:scale-[0.98]"
          onClick={() => navigate('/restaurants')}
        >
          <img 
            src="/assets/restaurants-home.png" 
            alt="Restaurants" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="text-foreground font-semibold text-xl">Restaurants</span>
          </div>
        </div>

        {/* Small Category Cards */}
        <div className="flex gap-2">
          {categories.map((category, index) => (
            <div 
              key={category.name} 
              className={`relative flex-1 h-24 overflow-hidden ${
                index === 0 ? 'rounded-l-xl' : ''
              } ${
                index === categories.length - 1 ? 'rounded-r-xl' : ''
              }`}
            >
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-2">
                <span className="text-foreground font-medium text-sm">{category.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4th section - Meals */}
      <div className={`${responsivePx} mt-20 pb-24`}>
        <h2 className="text-foreground text-3xl mb-4">Meals</h2>
        
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No meals available</div>
        ) : (
          <div className="grid grid-cols-2 min-[500px]:grid-cols-3 min-[700px]:grid-cols-4 gap-2 space-y-2">
            {meals.map((meal) => (
              <div 
                key={meal.id} 
                className="backdrop-blur-lg rounded-xl overflow-hidden cursor-pointer transition-transform active:scale-95"
                style={{ 
                  backgroundColor: 'hsla(0, 0%, 10%, 0.8)', 
                  border: '1px solid hsl(0, 0%, 20%)' 
                }}
                onClick={() => navigate(`/meal/${meal.id}`, { state: meal })}
              >
                <div className="h-32 overflow-hidden">
                  <img 
                    src={meal.image} 
                    alt={meal.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-foreground font-semibold text-base truncate">{meal.name}</h3>
                  <p className="text-muted-foreground text-xs truncate">{meal.restaurant}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <img 
                      src="/assets/stopwatch 1-home.png" 
                      alt="Time" 
                      className="w-4 h-4"
                    />
                    <span>{meal.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-foreground font-bold text-base">{meal.price}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMealSelection(meal.id);
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        selectedMeals.has(meal.id)
                          ? 'bg-transparent border-2 border-primary'
                          : 'bg-primary'
                      }`}
                    >
                      <img 
                        src="/assets/plus 1-home.png" 
                        alt="Add" 
                        className="w-3 h-3"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating elements - positioned above bottom nav */}
      <div className={`fixed bottom-20 left-0 right-0 ${responsivePx} pointer-events-none z-40 flex items-center justify-center h-12`}>
        
        {/* Cart Notification - Single popup that updates */}
        {cartMessage && (
          <div className={`pointer-events-auto rounded-lg px-4 py-2 shadow-lg animate-fade-in ${
            cartMessage === 'added' ? 'bg-primary' : 'bg-muted'
          }`}>
            <span className="text-foreground font-medium text-xs whitespace-nowrap">
              {cartMessage === 'added' ? 'Added to cart' : 'Removed from cart'}
            </span>
          </div>
        )}

        {/* Up Arrow Button - Right side, only shows when scrolled */}
        {showScrollTop && (
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute right-4 min-[574px]:right-6 pointer-events-auto"
          >
            <img src="/assets/Back to top.png" alt="Back to top" className="w-15 h-15" />
          </button>
        )}
      </div>

      <MenuOverlay
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        profileImageSrc={PROFILE_AVATAR_IMAGE}
      />
      <BottomNav />
    </div>
  );
};

export default Home;
