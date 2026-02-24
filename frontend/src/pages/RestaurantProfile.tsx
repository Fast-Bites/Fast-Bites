import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Restaurant } from '../lib/api';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  deliveryTime: string;
}

const foodItems: MenuItem[] = [
  { id: '1', name: 'Jollof Rice & Chicken', price: 3500, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=200&fit=crop', deliveryTime: '20-30 mins' },
  { id: '2', name: 'Fried Rice Special', price: 4000, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop', deliveryTime: '25-35 mins' },
  { id: '3', name: 'Grilled Chicken Platter', price: 5500, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop', deliveryTime: '30-40 mins' },
  { id: '4', name: 'Peppered Snail', price: 6000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop', deliveryTime: '20-25 mins' },
  { id: '5', name: 'Suya Meat', price: 3000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop', deliveryTime: '15-20 mins' },
  { id: '6', name: 'Egusi Soup & Pounded Yam', price: 4500, image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop', deliveryTime: '25-35 mins' },
];

const drinkItems: MenuItem[] = [
  { id: '7', name: 'Chapman', price: 1500, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop', deliveryTime: '5-10 mins' },
  { id: '8', name: 'Zobo Drink', price: 800, image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300&h=200&fit=crop', deliveryTime: '5-10 mins' },
  { id: '9', name: 'Fresh Orange Juice', price: 1200, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop', deliveryTime: '5-10 mins' },
  { id: '10', name: 'Smoothie Bowl', price: 2000, image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=300&h=200&fit=crop', deliveryTime: '10-15 mins' },
];

const operatingHours = {
  weekdays: 'Mon - Thurs: 8:00 AM - 10:00 PM',
  weekend: 'Fri - Sat: 8:00 AM - 11:00 PM',
  sunday: 'Sun: Closed',
};

const RestaurantProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: _id } = useParams();
  const [activeTab, setActiveTab] = useState<'food' | 'drinks'>('food');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [showHoursTooltip, setShowHoursTooltip] = useState(false);

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

  const handleAddItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent card click
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleItemClick = (item: MenuItem) => {
    navigate(`/meal/${item.id}`, {
      state: {
        id: item.id,
        name: item.name,
        restaurant: restaurant.name,
        time: item.deliveryTime,
        price: `₦${item.price.toLocaleString()}`,
        image: item.image,
        rating: 4,
      }
    });
  };

  const currentItems = activeTab === 'food' ? foodItems : drinkItems;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Cover Image */}
      <div className="relative h-56">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center"
        >
          <span className="text-primary-foreground text-xl">&lt;</span>
        </button>
      </div>

      {/* Restaurant Info Card */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-card rounded-2xl p-4 shadow-lg">
          <div className="flex items-start gap-4">
            {/* Restaurant Logo */}
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop'}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Restaurant Details */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{restaurant.name}</h1>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <span className="text-primary mr-1">📍</span>
                {restaurant.address || 'Address not available'}
              </div>

              {/* Open/Closed Status */}
              <div className="flex items-center mt-2 relative">
                <span
                  className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    restaurant.is_open ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className={`text-sm ${restaurant.is_open ? 'text-green-500' : 'text-red-500'}`}>
                  {restaurant.is_open ? 'Open' : 'Closed'}
                </span>
                {!restaurant.is_open && (
                  <span className="text-muted-foreground text-sm ml-2">
                    • Opens at 9:00 AM tomorrow
                  </span>
                )}
                <button 
                  className="ml-2 text-muted-foreground"
                  onMouseEnter={() => setShowHoursTooltip(true)}
                  onMouseLeave={() => setShowHoursTooltip(false)}
                  onTouchStart={() => setShowHoursTooltip(true)}
                  onTouchEnd={() => setShowHoursTooltip(false)}
                >
                  <span className="text-sm">ⓘ</span>
                </button>

                {/* Operating Hours Tooltip */}
                {showHoursTooltip && (
                  <div className="absolute left-0 top-8 bg-zinc-800 rounded-xl p-4 shadow-lg z-20 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground">ⓘ</span>
                      <span className="font-semibold text-foreground">Operating hours</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{operatingHours.weekdays}</p>
                      <p>{operatingHours.weekend}</p>
                      <p>{operatingHours.sunday}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Menu</h2>

        {/* Food/Drinks Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('food')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'food'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Food
          </button>
          <button
            onClick={() => setActiveTab('drinks')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'drinks'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Drinks
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 gap-4 pb-8">
          {currentItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-card rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => handleItemClick(item)}
            >
              <div className="h-28 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex items-center text-muted-foreground text-xs mt-1">
                  <span>🕐</span>
                  <span className="ml-1">{item.deliveryTime}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary font-bold text-sm">
                    ₦{item.price.toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => handleAddItem(e, item.id)}
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <span className="text-primary-foreground text-lg leading-none">+</span>
                  </button>
                </div>
                {selectedItems[item.id] && (
                  <div className="text-xs text-primary mt-1">
                    Added: {selectedItems[item.id]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
