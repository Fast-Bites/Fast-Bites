import type { CustomerReview } from '@/lib/restaurantReviewsMock';
import StarRating from '@/components/restaurant/StarRating';

type ReviewCardProps = {
  review: CustomerReview;
  onReply: () => void;
  onEditReply: () => void;
  onDeleteReply: () => void;
};

export default function ReviewCard({
  review,
  onReply,
  onEditReply,
  onDeleteReply,
}: ReviewCardProps) {
  const hasReply = Boolean(review.reply);

  return (
    <article className="flex flex-col rounded-[10px] bg-white p-3 shadow-[0px_0px_5px_rgba(0,0,0,0.1)] sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="size-10 shrink-0 overflow-hidden rounded-full bg-[#d9d9d9]">
            {review.avatarUrl ? (
              <img
                src={review.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base text-[#111111] font-bold">{review.customerName}</p>
            <p className="text-[11px] text-[#6a6a6a]">{review.timeAgo}</p>
          </div>
        </div>
        <StarRating value={review.rating} size={15} />
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-[11px] leading-relaxed text-[#111111]">
        {review.body}
      </p>

      <div className="mt-3 flex gap-2">
        {hasReply ? (
          <>
            <button
              type="button"
              onClick={onEditReply}
              className="inline-flex h-[30px] flex-1 items-center justify-center rounded-full bg-[#111111] px-3 text-[11px] text-white transition hover:bg-[#111111]/90"
            >
              Edit reply
            </button>
            <button
              type="button"
              onClick={onDeleteReply}
              className="inline-flex h-[30px] flex-1 items-center justify-center rounded-full border border-[#ff2c2c] bg-white px-3 text-[11px] text-[#ff2c2c] transition hover:bg-[#ff2c2c]/5"
            >
              Delete reply
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onReply}
            className="inline-flex h-[30px] w-full items-center justify-center rounded-full bg-[#111111] px-3 text-[11px] text-white transition hover:bg-[#111111]/90"
          >
            Reply to comment
          </button>
        )}
      </div>
    </article>
  );
}
