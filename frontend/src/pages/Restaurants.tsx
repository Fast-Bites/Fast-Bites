import { useState, useEffect, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Restaurant } from '../lib/api';
import BackButton from '../components/BackButton';
import ResendOverlay from '../components/ResendOverlay';
import SearchBar from '../components/SearchBar';
import { operatingHoursMessage } from '../constants/operatingHours';
import { responsivePx } from '../constants/responsive';
import {
  closingTimeForDisplay,
  formatRatingDisplay,
  isOpenForDisplay,
  resolveRating,
} from '../lib/restaurantDisplay';

/** Always listed first; API rows with other ids are appended (see fetch). */
const placeholderRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Chicken Republic',
    address: '147 ABC road, XY Street',
    latitude: 0,
    longitude: 0,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop',
    rating: 4.0,
  },
  {
    id: '2',
    name: 'Hungryman Eatery',
    address: '258 EFG road, UK Street',
    latitude: 0,
    longitude: 0,
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop',
    rating: 3.5,
  },
  {
    id: '3',
    name: 'The Food Palace',
    address: '99 Main Street, Downtown',
    latitude: 0,
    longitude: 0,
    image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=250&fit=crop',
    rating: 4.5,
  },
];

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(placeholderRestaurants);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.getRestaurants(20, 0);
        if (response.data && response.data.length > 0) {
          const placeholderIds = new Set(
            placeholderRestaurants.map((r) => String(r.id))
          );
          const fromApi = response.data
            .filter((r) => !placeholderIds.has(String(r.id)))
            .map((r) => ({
              ...r,
              rating: resolveRating(r),
              is_open: isOpenForDisplay(String(r.id)),
            }));
          setRestaurants([...placeholderRestaurants, ...fromApi]);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };
    fetchRestaurants();
  }, []);

  const toggleOperatingHours = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    setShowTooltip((prev) => (prev === id ? null : id));
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } });
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      {/* Match MealDetails: same horizontal padding + pt-10 as map-title header */}
      <div className={`${responsivePx} pt-10 pb-4`}>
        <BackButton variant="map" title="Restaurants" />
      </div>

      {/* Search Bar */}
      <div className={`${responsivePx} mb-4`}>
        <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Restaurant List */}
      <div className={`${responsivePx} pb-8 space-y-6`}>
        {filteredRestaurants.map((restaurant) => {
          const displayRating = resolveRating(restaurant);
          const isOpen = isOpenForDisplay(String(restaurant.id));
          return (
          <div
            key={restaurant.id}
            className="relative rounded-2xl overflow-hidden bg-card cursor-pointer"
            onClick={() => handleRestaurantClick(restaurant)}
          >
            {/* Restaurant Image */}
            <div className="h-36 min-[450px]:h-36 overflow-hidden">
              <img
                src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Restaurant Info — equal gap between every block (incl. ratings) */}
            <div className="flex flex-col gap-2 p-2">
              <h3 className="truncate text-base font-semibold text-foreground">
                {restaurant.name}
              </h3>
              <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <img
                  src="/assets/pin 3.svg"
                  alt=""
                  className="h-4 w-4 shrink-0"
                />
                <span className="max-w-full text-center leading-snug">
                  {restaurant.address || 'Address not available'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        isOpen ? 'bg-app-green' : 'bg-red-500'
                      }`}
                    />
                    <span className={`text-xs font-medium ${isOpen ? 'text-app-green' : 'text-red-500'}`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                    <span className="text-xs text-muted-foreground" aria-hidden="true">
                      •
                    </span>
                    {isOpen ? (
                      <span className="text-xs text-muted-foreground">
                        Closes at {closingTimeForDisplay(String(restaurant.id))}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Opens at 9:00 AM tomorrow
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label="Operating hours"
                      aria-expanded={showTooltip === restaurant.id}
                      onClick={(e) => toggleOperatingHours(e, restaurant.id)}
                      className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-muted/30"
                    >
                      <img src="/assets/info 1.svg" alt="info" className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={star <= displayRating ? '#FFD700' : 'none'}
                      stroke="#FFD700"
                      strokeWidth="2"
                    >
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({formatRatingDisplay(displayRating)})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestaurantClick(restaurant);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary"
                >
                  <img src="/assets/Next 1.svg" alt="" className="h-5 w-5" />
                </button>
              </div>
            </div>

          </div>
          );
        })}
      </div>
      
      {/* Operating Hours Overlay */}
      <ResendOverlay
        visible={showTooltip !== null}
        message={operatingHoursMessage}
        onClose={() => setShowTooltip(null)}
        type="warning"
        iconSrc="/assets/info 1.svg"
        title="Operating hours"
        align="left"
      />
    </div>
  );
};

export default Restaurants;
