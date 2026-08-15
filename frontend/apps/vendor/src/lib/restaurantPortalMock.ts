export type OrderStatus =
  | 'processing'
  | 'preparing'
  | 'pending'
  | 'ready'
  | 'completed'
  | 'canceled';

export type DashboardOrderAction =
  | { kind: 'accept_cancel' }
  | { kind: 'ready' }
  | { kind: 'waiting_courier' }
  | { kind: 'details' };

export type DashboardOrder = {
  id: string;
  items: string;
  time: string;
  status: OrderStatus;
  action: DashboardOrderAction;
};

export type BestSeller = {
  id: string;
  name: string;
  price: string;
  ordersToday: number;
  image: string;
};

export type QueueOrder = {
  id: string;
  label: string;
  items: string;
  address: string;
  actionLabel: 'Prepare' | 'Process';
  image: string;
};

/** Demo data until vendor orders API is wired. */
export const DASHBOARD_STATS = {
  todayOrders: 196,
  todayOrdersDelta: 5,
  revenue: '₦135,000',
  revenueDelta: 15,
  revenueItems: '1500 items',
  pendingOrders: 31,
  completedOrders: 190,
} as const;

export const DASHBOARD_ORDERS: DashboardOrder[] = [
  {
    id: '#984656',
    items: 'Rice and sauce\n(+1)',
    time: 'Just now',
    status: 'preparing',
    action: { kind: 'accept_cancel' },
  },
  {
    id: '#369125',
    items: 'Blueberry\npancake',
    time: '1 mins ago',
    status: 'pending',
    action: { kind: 'ready' },
  },
  {
    id: '#236123',
    items: 'Rice and sauce\n(+1)',
    time: '4 mins ago',
    status: 'ready',
    action: { kind: 'waiting_courier' },
  },
  {
    id: '#013654',
    items: 'Rice and stew\n(+1)',
    time: '4 mins ago',
    status: 'pending',
    action: { kind: 'ready' },
  },
  {
    id: '#656984',
    items: 'Rice and stew\n(+1)',
    time: '6 mins ago',
    status: 'pending',
    action: { kind: 'ready' },
  },
  {
    id: '#945856',
    items: 'Rice and stew\n(+1)',
    time: '14 mins ago',
    status: 'ready',
    action: { kind: 'waiting_courier' },
  },
  {
    id: '#866946',
    items: 'Rice and stew\n(+1)',
    time: '1 hour ago',
    status: 'completed',
    action: { kind: 'details' },
  },
];

export const BEST_SELLERS: BestSeller[] = [
  {
    id: '1',
    name: 'Rice',
    price: '₦1500',
    ordersToday: 32,
    image:
      'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Vegetable salad',
    price: '₦3500',
    ordersToday: 26,
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Blueberry pancake',
    price: '₦2500',
    ordersToday: 20,
    image:
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Grilled chicken',
    price: '₦4500',
    ordersToday: 18,
    image:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Jollof rice',
    price: '₦2800',
    ordersToday: 15,
    image:
      'https://images.unsplash.com/photo-1604329760661-eae628fc5417?w=400&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Beef burger',
    price: '₦3200',
    ordersToday: 14,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
  },
  {
    id: '7',
    name: 'Fried plantain',
    price: '₦1200',
    ordersToday: 12,
    image:
      'https://images.unsplash.com/photo-1604329760661-eae628fc5417?w=400&h=400&fit=crop',
  },
  {
    id: '8',
    name: 'Chicken pizza',
    price: '₦5500',
    ordersToday: 11,
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
  },
];

export const ORDER_FILTERS = [
  { key: 'all' as const, label: 'All', count: 200, tone: 'black' as const },
  { key: 'prepared' as const, label: 'Prepared', count: 19, tone: 'orange' as const },
  { key: 'completed' as const, label: 'Completed', count: 10, tone: 'green' as const },
  { key: 'canceled' as const, label: 'Canceled', count: 5, tone: 'red' as const },
];

export const QUEUE_ORDERS: QueueOrder[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  label: `Order ${i + 1}`,
  items: i === 9 ? 'Rice and sauce (+1)' : 'Rice and 1 more',
  address: 'No. 2 XYZ Street',
  actionLabel: i < 3 ? 'Prepare' : 'Process',
  image:
    'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400&h=400&fit=crop',
}));

export const IN_PROGRESS_BANNER = {
  title: 'In progress',
  orderLabel: 'Order #1',
  when: 'February 20, 2026, 10:55am',
} as const;

export type OrderServing = {
  title: string;
  main: string;
  proteins: string;
  extras: string;
};

export type OrderDetail = {
  id: string;
  label: string;
  when: string;
  address: string;
  image: string;
  servings: OrderServing[];
  serviceFee: string;
  total: string;
};

export const ORDER_DETAIL_DEMO: OrderDetail = {
  id: '1',
  label: 'Order #1',
  when: 'February 20, 2026, 10:55am',
  address: 'No. 2 XYZ Street',
  image:
    'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=600&h=600&fit=crop',
  servings: [
    {
      title: 'First serving',
      main: 'Rice',
      proteins: 'Beef, chicken, fried fish',
      extras: 'Boiled egg, fried plantains, beef, chicken, fried fish.',
    },
    {
      title: 'Second serving',
      main: 'Rice',
      proteins: 'Beef, chicken',
      extras: 'Boiled egg, fried plantains, beef, chicken, fried fish.',
    },
  ],
  serviceFee: '₦1000',
  total: '₦1000',
};

export const ORDER_DETAILS_LIST: Array<{
  id: string;
  label: string;
  when: string;
  image: string;
}> = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  label: `Order #${i + 1}`,
  when: 'February 20, 2026  10:55am',
  image:
    'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=200&h=200&fit=crop',
}));

