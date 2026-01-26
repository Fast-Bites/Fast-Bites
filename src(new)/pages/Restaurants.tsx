import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Restaurant } from '../lib/api';

const placeholderRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Chicken Republic',
    address: '147 ABC road, XY Street',
    latitude: 0,
    longitude: 0,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop',
    rating: 4.0,
    is_open: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Hungryman Eatery',
    address: '258 EFG road, UK Street',
    latitude: 0,
    longitude: 0,
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop',
    rating: 3.5,
    is_open: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'The Food Palace',
    address: '99 Main Street, Downtown',
    latitude: 0,
    longitude: 0,
    image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=250&fit=crop',
    rating: 4.5,
    is_open: true,
    created_at: new Date().toISOString(),
  },
];

const operatingHours = {
  weekdays: 'Mon - Thurs: 8:00 AM - 10:00 PM',
  weekend: 'Fri - Sat: 8:00 AM - 11:00 PM',
  sunday: 'Sun: Closed',
};

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(placeholderRestaurants);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.getRestaurants(20, 0);
        if (response.data && response.data.length > 0) {
          setRestaurants(response.data);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };
    fetchRestaurants();
  }, []);

  const handleMouseEnter = (id: string) => {
    setHoveredId(id);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(id);
    }, 1000);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setShowTooltip(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } });
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-500'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
        >
          <span className="text-primary-foreground text-xl">&lt;</span>
        </button>
        <h1 className="text-xl font-bold">Restaurants</h1>
        <div className="w-10" />
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <img
            src="/assets/search 2.png"
            alt="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-60"
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 rounded-lg py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Restaurant List */}
      <div className="px-4 pb-8 space-y-6">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="relative rounded-2xl overflow-hidden bg-card cursor-pointer"
            onClick={() => handleRestaurantClick(restaurant)}
            onMouseEnter={() => handleMouseEnter(restaurant.id)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => handleMouseEnter(restaurant.id)}
            onTouchEnd={handleMouseLeave}
          >
            {/* Restaurant Image */}
            <div className="h-48 overflow-hidden">
              <img
                src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Restaurant Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {restaurant.name}
              </h3>
              
              <div className="flex items-center text-muted-foreground text-sm mb-2">
                <span className="text-primary mr-1">📍</span>
                {restaurant.address || 'Address not available'}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
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
                    <button className="ml-1 text-muted-foreground">
                      <span className="text-sm">ⓘ</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  {renderStars(restaurant.rating || 0)}
                  <span className="text-muted-foreground text-sm ml-1">
                    ({restaurant.rating?.toFixed(1) || '0.0'})
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestaurantClick(restaurant);
                  }}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                >
                  <span className="text-primary-foreground text-lg">→</span>
                </button>
              </div>
            </div>

            {/* Operating Hours Tooltip */}
            {showTooltip === restaurant.id && (
              <div className="absolute left-4 top-56 bg-zinc-800 rounded-xl p-4 shadow-lg z-10 min-w-[220px]">
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
        ))}
      </div>
    </div>
  );
};

export default Restaurants;
