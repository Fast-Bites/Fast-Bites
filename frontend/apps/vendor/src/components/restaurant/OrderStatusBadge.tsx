import type { OrderStatus } from '@/lib/restaurantPortalMock';

const STATUS_STYLES: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  processing: {
    label: 'Processing',
    className: 'bg-[#a3ceff]/40 text-[#0051ae]',
    dot: 'bg-[#0051ae]',
  },
  preparing: {
    label: 'Preparing',
    className: 'bg-[#a3ceff]/40 text-[#0051ae]',
    dot: 'bg-[#0051ae]',
  },
  pending: {
    label: 'Pending',
    className: 'bg-[#ffa17d]/40 text-[#ff6930]',
    dot: 'bg-[#ff6930]',
  },
  ready: {
    label: 'Ready',
    className: 'bg-[#92ff92]/80 text-[#00af00]',
    dot: 'bg-[#00af00]',
  },
  completed: {
    label: 'Completed',
    className: 'bg-[#c0c0c0]/50 text-[#111111]',
    dot: 'bg-[#111111]',
  },
  canceled: {
    label: 'Canceled',
    className: 'bg-[#ff2c2c]/15 text-[#ff2c2c]',
    dot: 'bg-[#ff2c2c]',
  },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${style.className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
