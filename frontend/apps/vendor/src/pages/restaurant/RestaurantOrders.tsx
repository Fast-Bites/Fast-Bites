import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin } from 'lucide-react';
import OrderDetailBody from '@/components/restaurant/OrderDetailBody';
import {
  IN_PROGRESS_BANNER,
  ORDER_DETAIL_DEMO,
  ORDER_FILTERS,
  QUEUE_ORDERS,
} from '@/lib/restaurantPortalMock';

type FilterKey = (typeof ORDER_FILTERS)[number]['key'];

/** Wide enough for the longest filter label ("Completed") + count badge. */
const FILTER_BUTTON_WIDTH = 'w-[170px]';

const FILTER_COUNT_BG: Record<(typeof ORDER_FILTERS)[number]['tone'], string> = {
  black: 'bg-black',
  orange: 'bg-[#ff6930]',
  green: 'bg-[#00af00]',
  red: 'bg-[#ff2c2c]',
};

export default function RestaurantOrders() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [inProgressOpen, setInProgressOpen] = useState(false);

  const visibleOrders = useMemo(() => {
    if (filter === 'all') return QUEUE_ORDERS;
    if (filter === 'prepared') return QUEUE_ORDERS.slice(0, 3);
    if (filter === 'completed') return QUEUE_ORDERS.slice(3, 6);
    return QUEUE_ORDERS.slice(6);
  }, [filter]);

  return (
    <div className="space-y-5 pb-8">
      <h2 className="text-[22px] font-bold text-[#111111] sm:text-[26px]">Orders</h2>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {ORDER_FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={[
                FILTER_BUTTON_WIDTH,
                'inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-full bg-white px-3 text-base text-[#111111] shadow-[0px_3px_10px_rgba(0,0,0,0.05)] transition',
                active ? 'ring-2 ring-[#111111]/20' : '',
              ].join(' ')}
            >
              <span className="leading-none">{item.label}</span>
              <span
                className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full text-base leading-none text-white ${FILTER_COUNT_BG[item.tone]}`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[10px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <div>
            <p className="text-base font-bold text-[#111111]">
              {IN_PROGRESS_BANNER.title}
            </p>
            <p className="mt-1 text-sm text-[#111111]">
              <span>{IN_PROGRESS_BANNER.orderLabel}</span>
              <span className="mx-3">{IN_PROGRESS_BANNER.when}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInProgressOpen((open) => !open)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#c0c0c0]"
            aria-expanded={inProgressOpen}
            aria-label={inProgressOpen ? 'Collapse in progress' : 'Expand in progress'}
          >
            <ChevronDown
              size={18}
              className={[
                'text-white transition-transform',
                inProgressOpen ? 'rotate-180' : '',
              ].join(' ')}
              strokeWidth={2.5}
            />
          </button>
        </div>

        {inProgressOpen ? (
          <div className="border-t border-[#c0c0c0] px-3 py-4 sm:px-4">
            <OrderDetailBody detail={ORDER_DETAIL_DEMO} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
        {visibleOrders.map((order) => (
          <article
            key={order.id}
            className="rounded-[10px] bg-white p-2.5 shadow-[0px_4px_10px_rgba(0,0,0,0.05)]"
          >
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className="text-[#111111]">Next order</span>
              <span className="size-1.5 rounded-full bg-[#c0c0c0]" />
              <span className="text-[#c0c0c0]">{order.label}</span>
            </div>

            <div className="flex gap-3">
              <div className="size-[96px] shrink-0 overflow-hidden rounded-[10px] bg-[#d9d9d9] sm:size-[107px]">
                <img
                  src={order.image}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#111111]">
                  {order.items}
                </p>
                <Link
                  to={`/orders/details/${order.id}`}
                  className="mt-1 inline-block text-[11px] text-[#272727] underline-offset-2 hover:underline"
                >
                  View list
                </Link>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#111111]">
                  <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <MapPin size={10} />
                  </span>
                  <span className="truncate">{order.address}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/orders/details/${order.id}`)}
                  className="mt-3 w-full rounded-full bg-[#111111] py-1.5 text-[11px] text-white"
                >
                  {order.actionLabel}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
