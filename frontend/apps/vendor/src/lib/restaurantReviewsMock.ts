export type CustomerReview = {
  id: string;
  customerName: string;
  avatarUrl: string | null;
  timeAgo: string;
  rating: number;
  body: string;
  reply: string | null;
};

export const REVIEW_STATS = {
  overallRating: 5.0,
  overallDelta: 3,
  totalReviewsLabel: '7.1k',
  totalDelta: 30,
  totalCaption: 'Feedback so far',
  distribution: [
    { stars: 5, percent: 80 },
    { stars: 4, percent: 73 },
    { stars: 3, percent: 54 },
    { stars: 2, percent: 20 },
    { stars: 1, percent: 5 },
  ],
} as const;

const SAMPLE_BODY =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const TIMES = ['Just now', '1 hour ago', '5 hours ago', 'Yesterday', '2 days ago', '1 week ago'];

/** Demo reviews until vendor reviews API is wired. */
export const DEMO_REVIEWS: CustomerReview[] = TIMES.map((timeAgo, index) => ({
  id: `review-${index + 1}`,
  customerName: 'John Doe',
  avatarUrl: null,
  timeAgo,
  rating: index === 0 ? 5 : 4,
  body: SAMPLE_BODY,
  reply: index === 0 ? 'Thank you for your feedback! We appreciate your visit.' : null,
}));

export const DEMO_BUSINESS_NAME = 'Restaurant Name';
