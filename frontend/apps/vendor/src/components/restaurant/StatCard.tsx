import type { ReactNode } from 'react';

type StatCardProps = {
  icon: ReactNode;
  iconBg: string;
  title: string;
  value: string;
  valueClassName?: string;
  badge?: ReactNode;
  footer?: ReactNode;
};

export default function StatCard({
  icon,
  iconBg,
  title,
  value,
  valueClassName = 'text-[#111111]',
  badge,
  footer,
}: StatCardProps) {
  return (
    <article className="rounded-[10px] bg-white p-4 shadow-[0px_4px_10px_rgba(0,0,0,0.05)] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ${iconBg}`}
        >
          {icon}
        </div>
        {badge}
      </div>
      <p className="mt-3 text-sm text-[#111111] sm:text-base">{title}</p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 ">
        <p
          className={`text-2xl font-bold tracking-tight sm:text-[32px] ${valueClassName}`}
        >
          {value}
        </p>
        {footer ? <div className="mb-1 shrink-0">{footer}</div> : null}
      </div>
    </article>
  );
}
