import { useEffect, useId, useState } from 'react';
import type { CustomerReview } from '@/lib/restaurantReviewsMock';
import StarRating from '@/components/restaurant/StarRating';

type ReviewReplyModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  review: CustomerReview | null;
  businessName: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
};

export default function ReviewReplyModal({
  open,
  mode,
  review,
  businessName,
  onClose,
  onSubmit,
}: ReviewReplyModalProps) {
  const labelId = useId();
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!open || !review) return;
    setDraft(mode === 'edit' ? review.reply ?? '' : '');
  }, [open, mode, review]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !review) return null;

  const submitLabel = mode === 'edit' ? 'Update' : 'Reply';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#111111]/25 backdrop-blur-[2px]"
        aria-label="Close reply dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="relative z-10 w-full max-w-lg rounded-[10px] bg-white p-4 shadow-[0px_0px_10px_rgba(0,0,0,0.2)] sm:p-5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="size-10 shrink-0 overflow-hidden rounded-full bg-[#d9d9d9]">
              {review.avatarUrl ? (
                <img src={review.avatarUrl} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base text-[#111111] font-bold">{review.customerName}</p>
              <p className="text-[11px] text-[#6a6a6a]">{review.timeAgo}</p>
            </div>
          </div>
          <StarRating value={review.rating} size={15} />
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-[#111111]">{review.body}</p>

        <div className="mt-5 flex items-center gap-2">
          <div className="relative size-10 shrink-0 rounded-full bg-[#d9d9d9]">
            <img
              src={`${import.meta.env.BASE_URL}assets/verify-badge.png`}
              alt=""
              className="absolute -bottom-0.5 -right-0.5 size-5 object-contain"
            />
          </div>
          <div>
            <p id={labelId} className="text-base text-[#111111] font-bold">
              {businessName}
            </p>
            <p className="text-[11px] text-[#6a6a6a]">Owner</p>
          </div>
        </div>

        <div className="relative mt-3">
          <label
            htmlFor="review-reply-draft"
            className="absolute -top-2 left-3 z-10 bg-white px-1 text-[11px] text-[#e5460a]"
          >
            Replying publicly
          </label>
          <textarea
            id="review-reply-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            className="w-full resize-none rounded-[5px] border border-[#e5460a] bg-white px-3 py-3 text-sm text-[#111111] outline-none placeholder:text-[#c0c0c0]"
            placeholder="Write your reply…"
            autoFocus
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const text = draft.trim();
              if (!text) return;
              onSubmit(text);
            }}
            className="inline-flex h-[30px] min-w-[71px] items-center justify-center rounded-[3px] bg-[#e5460a] px-3 text-sm text-white transition hover:bg-[#e5460a]/90"
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[30px] min-w-[71px] items-center justify-center rounded-[3px] border border-[#ff2c2c] bg-white px-3 text-sm text-[#ff2c2c] transition hover:bg-[#ff2c2c]/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
