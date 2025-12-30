import React, { useState, useEffect } from 'react';
import api, { MenuItemWithRestaurant } from '../lib/api';

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

// Placeholder images for meals without images - randomly assigned
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', // Pizza
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', // Pancakes
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', // Salad
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', // BBQ
];

// Helper to format delivery time
const formatDeliveryTime = (minutes?: number): string => {
  if (!minutes) return '30 mins';
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
  }
  return `${minutes} mins`;
};

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealDisplay[]>([]);
  const [loading, setLoading] = useState(true);

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

  const categories = [
    { name: 'Shops', image: '/assets/shops.png' },
    { name: 'Pharmacy', image: '/assets/phamarcy.png' },
    { name: 'Local Market', image: '/assets/local market.png' },
  ];

  const navItems = [
    { id: 'home', label: 'Home', icon: '/assets/Home-home.png' },
    { id: 'discover', label: 'Discover', icon: '/assets/Discover-home.png' },
    { id: 'support', label: 'Support', icon: '/assets/Chat-home.png' },
    { id: 'wallet', label: 'Wallet', icon: '/assets/Wallet-home.png' },
  ];

  return (
    <div className="w-full min-h-screen bg-background font-[var(--font-poppins)]">
      {/* 1st section - Header (Fixed) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background flex items-center justify-between px-4 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden">
            <img 
              src="/assets/user 1 1-home.png" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-foreground text-lg">
              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Guest' : 'Loading...'}
            </h2>
            <p className="text-muted-foreground text-xs truncate max-w-[200px]">
              {user?.address || 'No address set'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center">
            <img 
              src="/assets/notification.png" 
              alt="History" 
              className="w-7 h-7"
            />
          </button>
          <button className="w-10 h-10 flex items-center justify-center">
            <img 
              src="/assets/shopping-cart-home.png" 
              alt="Cart" 
              className="w-7 h-7"
            />
          </button>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* 2nd section - Search */}
      <div className="px-4 mt-4">
        <div className="relative rounded-full overflow-hidden">
          {/* Orange background layer */}
          <div className="absolute inset-0 bg-primary/20" />
          
          {/* Repeating logo pattern overlay - rotated with offset rows */}
          <div 
            className="absolute opacity-20 pointer-events-none"
            style={{
              width: '800%',
              height: '800%',
              top: '-350%',
              left: '-350%',
              transform: 'rotate(-35deg)',
              backgroundImage: `
                url('/logo/Fast bite transparent I.png'),
                url('/logo/Fast bite transparent I.png')
              `,
              backgroundSize: '20px',
              backgroundRepeat: 'space',
            }}
          />
          
          {/* Content layer */}
          <div className="relative flex items-center px-4 py-3 gap-3">
            <img 
              src="/assets/search white.png" 
              alt="Search" 
              className="w-5 h-5"
            />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent text-foreground placeholder:text-muted-foreground text-base flex-1 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3rd section - Categories */}
      <div className="px-4 mt-6">
        {/* Restaurants - Large Card */}
        <div className="relative h-32 rounded-xl overflow-hidden mb-3">
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
      <div className="px-4 mt-10 pb-24">
        <h2 className="text-foreground text-3xl mb-4">Meals</h2>
        
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No meals available</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {meals.map((meal) => (
              <div 
                key={meal.id} 
                className="backdrop-blur-lg rounded-xl overflow-hidden"
                style={{ 
                  backgroundColor: 'hsla(0, 0%, 10%, 0.8)', 
                  border: '1px solid hsl(0, 0%, 20%)' 
                }}
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
                    <button className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
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

      {/* 5th section - Bottom Navigation (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-muted/20 px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 w-14 h-14 rounded-full transition-all items-center justify-center ${
                activeTab === item.id 
                  ? 'bg-primary' 
                  : 'bg-transparent'
              }`}
            >
              <img 
                src={item.icon} 
                alt={item.label} 
                className="w-[18px] h-[18px]"
              />
              <span className={`text-[10px] ${
                activeTab === item.id 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
