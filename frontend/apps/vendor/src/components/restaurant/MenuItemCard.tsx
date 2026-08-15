import { useNavigate } from 'react-router-dom';
import type { RestaurantMenuItem } from '@/lib/restaurantMenuStore';
import { formatMenuPrice } from '@/lib/restaurantMenuStore';

const editIconSrc = `${import.meta.env.BASE_URL}assets/edit.svg`;

type MenuItemCardProps = {
  item: RestaurantMenuItem;
};

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const navigate = useNavigate();

  return (
    <article className="overflow-hidden rounded-[10px] bg-white shadow-[0px_0px_5px_rgba(0,0,0,0.3)]">
      <div className="relative aspect-[175/138] bg-[#d9d9d9]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="size-full object-cover"
          />
        ) : null}
        <button
          type="button"
          onClick={() => navigate(`/menu/edit/${item.id}`)}
          className="absolute right-2 top-2 flex size-[25px] items-center justify-center overflow-hidden rounded-full"
          aria-label={`Edit ${item.name}`}
        >
          <img src={editIconSrc} alt="" className="size-full object-cover" />
        </button>
      </div>

      <div className="px-2 pb-2.5 pt-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="min-w-0 flex-1 truncate text-base font-semibold leading-tight text-[#111111] sm:text-xl"
            title={item.name}
          >
            {item.name}
          </h3>
          <span className="shrink-0 rounded-full border-[0.5px] border-[#111111] px-2.5 py-1 text-[11px] text-[#111111]">
            {formatMenuPrice(item.price)}
          </span>
        </div>
        <p className="mt-1 truncate text-[8px] text-[#6a6a6a] sm:text-xs">
          {item.category}
        </p>
      </div>
    </article>
  );
}
