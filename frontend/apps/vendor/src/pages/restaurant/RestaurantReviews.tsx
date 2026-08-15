import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import ReviewCard from '@/components/restaurant/ReviewCard';
import ReviewReplyModal from '@/components/restaurant/ReviewReplyModal';
import StarRating from '@/components/restaurant/StarRating';
import {
  DEMO_BUSINESS_NAME,
  DEMO_REVIEWS,
  REVIEW_STATS,
  type CustomerReview,
} from '@/lib/restaurantReviewsMock';

type ReplyTarget = {
  reviewId: string;
  mode: 'create' | 'edit';
};

function ReviewsSkeleton() {
  return (
    <div className="space-y-4 pb-8" aria-busy="true" aria-label="Loading reviews">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-[125px] rounded-[5px] bg-[#c0c0c0]" />
        <div className="h-[125px] rounded-[5px] bg-[#c0c0c0]" />
      </div>
      <div className="h-[175px] rounded-[5px] bg-[#c0c0c0]" />
      <div className="h-8 w-28 rounded bg-[#c0c0c0]" />
      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[180px] rounded-[10px] bg-[#c0c0c0]" />
        ))}
      </div>
    </div>
  );
}

function DeltaBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-sm leading-none text-[#00af00]">
      <TrendingUp size={12} strokeWidth={2.5} />
      {value}%
    </span>
  );
}

function barTone(stars: number): { bar: string; text: string } {
  if (stars >= 5) return { bar: 'bg-[#e5460a]', text: 'text-[#e5460a]' };
  if (stars === 4) return { bar: 'bg-[#e5460acc]', text: 'text-[#e5460acc]' };
  if (stars === 3) return { bar: 'bg-[#e5460a99]', text: 'text-[#e5460a99]' };
  if (stars === 2) return { bar: 'bg-[#e5460a66]', text: 'text-[#e5460a66]' };
  return { bar: 'bg-[#e5460a33]', text: 'text-[#e5460a66]' };
}

export default function RestaurantReviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<CustomerReview[]>(DEMO_REVIEWS);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const activeReview = replyTarget
    ? reviews.find((item) => item.id === replyTarget.reviewId) ?? null
    : null;

  const upsertReply = (text: string) => {
    if (!replyTarget) return;
    setReviews((current) =>
      current.map((item) =>
        item.id === replyTarget.reviewId ? { ...item, reply: text } : item,
      ),
    );
    setReplyTarget(null);
  };

  const deleteReply = (reviewId: string) => {
    setReviews((current) =>
      current.map((item) =>
        item.id === reviewId ? { ...item, reply: null } : item,
      ),
    );
  };

  if (loading) {
    return <ReviewsSkeleton />;
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-[5px] bg-white p-4 shadow-[0px_0px_5px_rgba(0,0,0,0.1)]">
          <p className="text-xs text-[#6a6a6a]">Overall rating</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-[32px] font-bold leading-none text-[#111111]">
              {REVIEW_STATS.overallRating.toFixed(1)}
            </p>
            <DeltaBadge value={REVIEW_STATS.overallDelta} />
          </div>
          <StarRating value={REVIEW_STATS.overallRating} size={16} className="mt-2" />
        </article>

        <article className="rounded-[5px] bg-white p-4 shadow-[0px_0px_5px_rgba(0,0,0,0.1)]">
          <p className="text-xs text-[#6a6a6a]">Total reviews</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-[32px] font-bold leading-none text-[#111111]">
              {REVIEW_STATS.totalReviewsLabel}
            </p>
            <DeltaBadge value={REVIEW_STATS.totalDelta} />
          </div>
          <p className="mt-2 text-[11px] text-[#6a6a6a]">{REVIEW_STATS.totalCaption}</p>
        </article>
      </div>

      <article className="rounded-[5px] bg-white p-4 shadow-[0px_0px_5px_rgba(0,0,0,0.1)] sm:p-5">
        <ul className="space-y-3">
          {REVIEW_STATS.distribution.map((row) => {
            const tone = barTone(row.stars);
            return (
              <li key={row.stars} className="flex items-center gap-2 sm:gap-3">
                <StarRating value={1} max={1} size={14} />
                <span className="w-3 shrink-0 text-sm text-[#111111]">{row.stars}</span>
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <div
                    className={`h-2.5 shrink-0 rounded-full ${tone.bar}`}
                    style={{ width: `${row.percent}%` }}
                  />
                  <span className={`shrink-0 text-[11px] ${tone.text}`}>
                    {row.percent}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </article>

      <h2 className="text-[22px] font-bold text-[#111111]">Reviews</h2>

      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onReply={() => setReplyTarget({ reviewId: review.id, mode: 'create' })}
            onEditReply={() => setReplyTarget({ reviewId: review.id, mode: 'edit' })}
            onDeleteReply={() => deleteReply(review.id)}
          />
        ))}
      </div>

      <ReviewReplyModal
        open={Boolean(replyTarget)}
        mode={replyTarget?.mode ?? 'create'}
        review={activeReview}
        businessName={DEMO_BUSINESS_NAME}
        onClose={() => setReplyTarget(null)}
        onSubmit={upsertReply}
      />
    </div>
  );
}
