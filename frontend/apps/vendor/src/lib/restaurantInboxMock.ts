export type InboxMessage = {
  id: string;
  from: 'customer' | 'vendor';
  text: string;
};

export type InboxThread = {
  id: string;
  name: string;
  preview: string;
  unreadCount: number;
  messages: InboxMessage[];
};

/** Demo inbox until messaging API is wired. */
export const DEMO_INBOX_THREADS: InboxThread[] = [
  {
    id: 'thread-1',
    name: 'John',
    preview: 'Lorem ipsum dolor sit...',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        from: 'customer',
        text: 'Hello, I have something to say about the app.',
      },
      {
        id: 'm2',
        from: 'customer',
        text: "What can't it do?",
      },
      {
        id: 'm3',
        from: 'vendor',
        text: "Hi, that's a really good question we don't have an answer to just yet but...",
      },
      {
        id: 'm4',
        from: 'vendor',
        text: "I guess we'll never know",
      },
    ],
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `thread-${i + 2}`,
    name: 'John',
    preview: 'Lorem ipsum dolor sit...',
    unreadCount: 0,
    messages: [
      {
        id: `t${i + 2}-m1`,
        from: 'customer' as const,
        text: 'Lorem ipsum dolor sit amet.',
      },
    ],
  })),
];
