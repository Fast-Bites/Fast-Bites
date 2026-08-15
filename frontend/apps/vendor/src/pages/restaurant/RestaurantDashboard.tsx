import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import OrderStatusBadge from '@/components/restaurant/OrderStatusBadge';
import StatCard from '@/components/restaurant/StatCard';
import {
  BEST_SELLERS,
  DASHBOARD_ORDERS,
  DASHBOARD_STATS,
  type DashboardOrder,
} from '@/lib/restaurantPortalMock';

const statsAsset = (file: string) =>
  `${import.meta.env.BASE_URL}assets/stats/${file}`;

function StatIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <img src={src} alt={alt} className="size-6 object-contain" />
  );
}

function DeltaBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#ddffdd] px-2 py-0.5 text-sm text-[#00af00]">
      <TrendingUp size={14} />
      {value}%
    </span>
  );
}

function orderDetailsPath(orderId: string) {
  return `/orders/details/${orderId.replace(/^#/, '')}`;
}

const actionBtnClass =
  'inline-flex items-center justify-center rounded-[5px] px-2.5 py-1.5 text-xs';

function OrderActions({ order }: { order: DashboardOrder }) {
  const detailsPath = orderDetailsPath(order.id);

  switch (order.action.kind) {
    case 'accept_cancel':
      return (
        <div className="flex w-full gap-1.5">
          <button
            type="button"
            className={`${actionBtnClass} flex-1 bg-[#0060af] text-white`}
          >
            Accept
          </button>
          <button
            type="button"
            className={`${actionBtnClass} flex-1 bg-[#ff2c2c] text-white`}
          >
            Cancel
          </button>
        </div>
      );
    case 'ready':
      return (
        <div className="flex w-full gap-1.5">
          <Link
            to={detailsPath}
            className={`${actionBtnClass} flex-1 border border-[#6a6a6a] text-[#111111]`}
          >
            Details
          </Link>
          <button
            type="button"
            className={`${actionBtnClass} flex-1 bg-[#00af00] text-white`}
          >
            Ready
          </button>
        </div>
      );
    case 'waiting_courier':
      return (
        <span className="block w-full text-center text-xs text-[#c0c0c0]">
          Waiting for courier
        </span>
      );
    case 'details':
      return (
        <Link
          to={detailsPath}
          className={`${actionBtnClass} w-full border border-[#6a6a6a] text-[#111111]`}
        >
          Details
        </Link>
      );
    default:
      return null;
  }
}

export default function RestaurantDashboard() {
  return (
    <div className="space-y-8 pb-8">
      <h2 className="text-[22px] font-bold text-[#111111] sm:text-[26px]">
        Dashboard activities
      </h2>

      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          icon={
            <StatIcon
              src={statsAsset('today-orders.png')}
              alt="Today’s orders"
            />
          }
          iconBg="bg-[#77ff77]/25"
          title="Today’s orders"
          value={String(DASHBOARD_STATS.todayOrders)}
          valueClassName="text-[#00af00]"
          badge={<DeltaBadge value={DASHBOARD_STATS.todayOrdersDelta} />}
        />
        <StatCard
          icon={
            <StatIcon src={statsAsset('revenue.png')} alt="Today’s Revenue" />
          }
          iconBg="bg-[#77ff77]/25"
          title="Today’s Revenue"
          value={DASHBOARD_STATS.revenue}
          badge={<DeltaBadge value={DASHBOARD_STATS.revenueDelta} />}
          footer={
            <span className="inline-flex rounded-full border border-[#c0c0c0] px-2 py-0.5 text-xs text-[#c0c0c0]">
              {DASHBOARD_STATS.revenueItems}
            </span>
          }
        />
        <StatCard
          icon={
            <StatIcon
              src={statsAsset('pending-orders.png')}
              alt="Pending orders"
            />
          }
          iconBg="bg-[#ffa17d]/25"
          title="Pending orders"
          value={String(DASHBOARD_STATS.pendingOrders)}
          valueClassName="text-[#ff6930]"
        />
        <StatCard
          icon={
            <StatIcon
              src={statsAsset('completed-orders.png')}
              alt="Completed orders"
            />
          }
          iconBg="bg-[#77ff77]/25"
          title="Completed orders"
          value={String(DASHBOARD_STATS.completedOrders)}
          valueClassName="text-[#00af00]"
        />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h3 className="text-[22px] font-bold text-[#111111]">Orders</h3>
          <Link
            to="/orders"
            className="text-[13px] text-[#111111] underline-offset-2 hover:underline font-medium"
          >
            See more
          </Link>
        </div>

        <div className="overflow-x-auto rounded-[10px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.05)]">
          <div className="hidden min-w-[560px] grid-cols-[4.5rem_minmax(0,0.7fr)_4.5rem_minmax(6.75rem,auto)_minmax(8.5rem,auto)] gap-3 bg-[#111111] px-3 py-3 text-center text-sm text-white min-[600px]:grid min-[600px]:px-4">
            <span>Order ID</span>
            <span>Items</span>
            <span>Time</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <ul className="divide-y divide-[#c0c0c0]">
            {DASHBOARD_ORDERS.map((order) => (
              <li
                key={order.id}
                className="grid min-w-0 grid-cols-1 gap-3 px-3 py-3 min-[600px]:min-w-[560px] min-[600px]:grid-cols-[4.5rem_minmax(0,0.7fr)_4.5rem_minmax(6.75rem,auto)_minmax(8.5rem,auto)] min-[600px]:items-center min-[600px]:justify-items-center min-[600px]:gap-3 min-[600px]:px-4 min-[600px]:text-center"
              >
                <div className="flex w-full items-center justify-between gap-2 min-[600px]:justify-center">
                  <span className="text-xs text-[#111111] min-[600px]:hidden">Order ID</span>
                  <span className="text-xs text-[#111111]">{order.id}</span>
                </div>
                <div className="flex w-full items-center justify-between gap-2 min-[600px]:justify-self-start min-[600px]:justify-start">
                  <span className="text-xs text-[#111111] min-[600px]:hidden">Items</span>
                  <p className="whitespace-pre-line text-right text-xs text-[#111111] min-[600px]:text-left">
                    {order.items}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-2 min-[600px]:justify-center">
                  <span className="text-xs text-[#111111] min-[600px]:hidden">Time</span>
                  <span className="text-xs text-[#111111]">{order.time}</span>
                </div>
                <div className="flex w-full min-w-0 items-center justify-between gap-2 min-[600px]:justify-center">
                  <span className="text-xs text-[#111111] min-[600px]:hidden">Status</span>
                  <div className="shrink-0">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
                <div className="flex w-full min-w-0 items-center justify-between gap-2 min-[600px]:justify-center">
                  <span className="text-xs text-[#111111] min-[600px]:hidden">Actions</span>
                  <div className="min-w-0 flex-1 min-[600px]:w-full">
                    <OrderActions order={order} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[22px] font-bold text-[#111111]">
          Best selling food
        </h3>
        <div className="grid grid-cols-2 gap-3 min-[500px]:grid-cols-3 min-[700px]:grid-cols-4">
          {BEST_SELLERS.map((item) => (
            <article
              key={item.id}
              className="rounded-[10px] bg-white p-2.5 shadow-[0px_4px_10px_rgba(0,0,0,0.05)]"
            >
              <div className="aspect-[160/167] overflow-hidden rounded-[10px] bg-[#d9d9d9]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-full object-cover"
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-bold leading-tight text-[#111111]" title={item.name}>
                  {item.name}
                </p>
                <span className="shrink-0 rounded-full border border-[#c0c0c0] px-1.5 py-0.5 text-xs tracking-tight text-[#111111]">
                  {item.price}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#111111]">
                {item.ordersToday} orders today
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
