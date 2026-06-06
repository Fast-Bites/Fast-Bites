import { useState, useEffect, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Restaurant } from '../lib/api';
import BackButton from '../components/BackButton';
import ResendOverlay from '../components/ResendOverlay';
import SearchBar from '../components/SearchBar';
import { responsivePx } from '../constants/responsive';
import {
  restaurantHoursStatus,
  restaurantIsOpen,
  restaurantOperatingHoursText,
} from '../lib/restaurantHours';
import { formatRatingDisplay, resolveRating } from '../lib/restaurantDisplay';

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [listNote, setListNote] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoursOverlayRestaurant, setHoursOverlayRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const response = await api.getRestaurants(20, 0);
      if (response.error) {
        setRestaurants([]);
        setListNote('Restaurants unavailable — connect to the API.');
        return;
      }
      const rows = response.data ?? [];
      if (rows.length === 0) {
        setRestaurants([]);
        setListNote('No restaurants in the database yet.');
        return;
      }
      setListNote(null);
      setRestaurants(
        rows.map((r) => ({
          ...r,
          rating: resolveRating(r),
        })),
      );
    };
    fetchRestaurants();
  }, []);

  const toggleOperatingHours = (e: MouseEvent<HTMLButtonElement>, restaurant: Restaurant) => {
    e.stopPropagation();
    setHoursOverlayRestaurant((prev) =>
      prev?.id === restaurant.id ? null : restaurant,
    );
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } });
  };

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`${responsivePx} pt-10 pb-4`}>
        <BackButton variant="map" title="Restaurants" />
      </div>

      <div className={`${responsivePx} mb-4`}>
        <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className={`${responsivePx} pb-8 space-y-6`}>
        {listNote && filteredRestaurants.length === 0 && (
          <p className="text-sm text-muted-foreground">{listNote}</p>
        )}
        {filteredRestaurants.map((restaurant) => {
          const displayRating = resolveRating(restaurant);
          const isOpen = restaurantIsOpen(restaurant);
          const hoursLine = restaurantHoursStatus(restaurant);
          return (
            <div
              key={restaurant.id}
              className="relative rounded-2xl overflow-hidden bg-card cursor-pointer"
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <div className="h-36 min-[450px]:h-36 overflow-hidden">
                <img
                  src={
                    restaurant.image_url ||
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'
                  }
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-2 p-2">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {restaurant.name}
                </h3>
                <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <img src="/assets/pin 3.svg" alt="" className="h-4 w-4 shrink-0" />
                  <span className="max-w-full text-center leading-snug">
                    {restaurant.address || 'Address not available'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          isOpen ? 'bg-popup-green' : 'bg-red-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          isOpen ? 'text-popup-green' : 'text-red-500'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                      <span className="text-xs text-muted-foreground" aria-hidden="true">
                        •
                      </span>
                      <span className="text-xs text-muted-foreground">{hoursLine}</span>
                      <button
                        type="button"
                        aria-label="Operating hours"
                        aria-expanded={hoursOverlayRestaurant?.id === restaurant.id}
                        onClick={(e) => toggleOperatingHours(e, restaurant)}
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

      <ResendOverlay
        visible={hoursOverlayRestaurant != null}
        message={
          hoursOverlayRestaurant
            ? restaurantOperatingHoursText(hoursOverlayRestaurant)
            : ''
        }
        onClose={() => setHoursOverlayRestaurant(null)}
        type="warning"
        iconSrc="/assets/info 1.svg"
        title="Operating hours"
        align="left"
      />
    </div>
  );
};

export default Restaurants;
