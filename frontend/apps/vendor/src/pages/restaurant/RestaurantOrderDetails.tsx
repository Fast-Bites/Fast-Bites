import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import OrderDetailBody from '@/components/restaurant/OrderDetailBody';
import {
  ORDER_DETAIL_DEMO,
  ORDER_DETAILS_LIST,
  type OrderDetail,
} from '@/lib/restaurantPortalMock';

function detailForId(orderId: string | undefined): OrderDetail {
  const match = ORDER_DETAILS_LIST.find((row) => row.id === orderId);
  if (!match) return ORDER_DETAIL_DEMO;
  return {
    ...ORDER_DETAIL_DEMO,
    id: match.id,
    label: match.label,
    when: match.when,
    image: match.image,
  };
}

export default function RestaurantOrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const selectedId = orderId ?? ORDER_DETAILS_LIST[0]?.id ?? '1';
  const detail = useMemo(() => detailForId(selectedId), [selectedId]);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-bold text-[#111111] sm:text-[26px]">
          Details
        </h2>
        <Link
          to="/dashboard"
          className="text-sm text-[#111111] underline-offset-2 hover:underline"
        >
          Back to orders
        </Link>
      </div>

      <div className="grid gap-3 min-[640px]:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.1fr)]">
        <aside className="overflow-hidden rounded-[10px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.05)]">
          <ul className="divide-y divide-[#c0c0c0]">
            {ORDER_DETAILS_LIST.map((row) => {
              const active = row.id === selectedId;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/orders/details/${row.id}`)}
                    className={[
                      'flex w-full items-center gap-3 px-3 py-3 text-left transition',
                      active ? 'bg-[#f3f9ff]' : 'hover:bg-[#f3f9ff]/70',
                    ].join(' ')}
                  >
                    <div className="size-[45px] shrink-0 overflow-hidden rounded-[8px] bg-[#d9d9d9]">
                      <img
                        src={row.image}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#111111]">
                        {row.label}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#c0c0c0]">
                        {row.when}
                      </p>
                    </div>
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <ChevronRight size={14} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="rounded-[10px] bg-white p-4 shadow-[0px_4px_10px_rgba(0,0,0,0.05)] sm:p-5">
          <div className="mb-4">
            <p className="text-base font-bold text-[#111111]">{detail.label}</p>
            <p className="mt-1 text-sm text-[#111111]">{detail.when}</p>
          </div>
          <OrderDetailBody detail={detail} />
        </section>
      </div>
    </div>
  );
}
