import { Star } from 'lucide-react';

type StarRatingProps = {
  value: number;
  max?: number;
  size?: number;
  className?: string;
};

export default function StarRating({
  value,
  max = 5,
  size = 14,
  className = '',
}: StarRatingProps) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        return (
          <Star
            key={i}
            size={size}
            strokeWidth={1.5}
            className={filled ? 'fill-[#FFD700] text-[#FFD700]' : 'fill-none text-[#c0c0c0]'}
          />
        );
      })}
    </div>
  );
}
