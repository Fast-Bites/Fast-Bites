import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import MenuItemCard from '@/components/restaurant/MenuItemCard';
import { getRestaurantMenuItems } from '@/lib/restaurantMenuStore';

const emptyCartSrc = `${import.meta.env.BASE_URL}assets/empty-cart.svg`;

export default function RestaurantMenu() {
  const navigate = useNavigate();
  const [items] = useState(() => getRestaurantMenuItems());
  const hasMenu = items.length > 0;

  return (
    <div className="relative flex min-h-[calc(100vh-7rem)] flex-col pb-24">
      <h2 className="text-[22px] font-bold text-[#111111] sm:text-[26px]">Menu</h2>

      {hasMenu ? (
        <div className="mt-4 grid grid-cols-2 gap-3 pb-4 min-[500px]:grid-cols-3 min-[700px]:grid-cols-4">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="flex size-[180px] flex-col items-center justify-center rounded-full bg-[#c0c0c0]/25 px-4 sm:size-[228px]">
            <img
              src={emptyCartSrc}
              alt=""
              className="size-[72px] object-contain sm:size-[90px]"
            />
            <p className="mt-3 text-center text-base text-[#6a6a6a]">No menu</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate('/menu/add')}
        className="fixed bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-lg bg-[#00af00] px-5 py-3 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(0,175,0,0.35)] transition hover:bg-[#00af00]/90 sm:right-8"
      >
        <Plus size={18} strokeWidth={2.5} />
        Add menu
      </button>
    </div>
  );
}
