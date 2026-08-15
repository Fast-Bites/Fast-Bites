import { MapPin } from 'lucide-react';
import type { OrderDetail } from '@/lib/restaurantPortalMock';

type OrderDetailBodyProps = {
  detail: OrderDetail;
  className?: string;
};

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-1 text-sm text-[#111111]">
      <span className="whitespace-nowrap font-bold">{label}:</span>
      <span className="min-w-0">{value}</span>
    </div>
  );
}

export default function OrderDetailBody({
  detail,
  className = '',
}: OrderDetailBodyProps) {
  return (
    <div
      className={[
        'grid gap-4 min-[560px]:grid-cols-[minmax(0,1.1fr)_minmax(140px,0.9fr)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="min-w-0 space-y-3 text-sm text-[#111111]">
        {detail.servings.map((serving, index) => (
          <div
            key={serving.title}
            className={[
              'flex flex-col gap-1',
              index > 0 ? 'border-t border-[#111111] pt-3' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <p className="text-black/50">{serving.title}</p>
            <DetailLine label="Main" value={serving.main} />
            <DetailLine label="Proteins" value={serving.proteins} />
            <DetailLine label="Extras" value={serving.extras} />
          </div>
        ))}

        <div className="border-t border-[#c0c0c0] pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold">Service</span>
            <span>{detail.serviceFee}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="font-bold">Total</span>
            <span>{detail.total}</span>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#111111]">Address</p>
        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
          <span className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MapPin size={10} />
          </span>
          <span className="truncate">{detail.address}</span>
        </div>
        <div className="mt-3 aspect-square overflow-hidden rounded-[10px] bg-[#d9d9d9]">
          <img
            src={detail.image}
            alt=""
            className="size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
