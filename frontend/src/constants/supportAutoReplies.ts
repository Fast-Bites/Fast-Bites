/** Placeholder “support” lines until a backend exists. */
export const SUPPORT_AUTO_REPLIES = [
  "Thanks for your message! A teammate will follow up shortly.",
  "We’ve received that — is there anything else we can help with?",
  "Got it. Let us know if you need help with an order or your wallet.",
  "Thanks! Our team typically replies within a few minutes during business hours.",
  "Hi there — we’re on it and will get back to you soon.",
  "Thanks for reaching out to Fast Bites support.",
  "Message received. If it’s urgent, you can also call us from the header.",
  "We appreciate the note — someone will review this shortly.",
  "Thanks! In the meantime, you can check your order status in the app.",
  "Received. Let us know if you’d like help with delivery or payment."
] as const;

export function pickRandomSupportReply(): string {
  const i = Math.floor(Math.random() * SUPPORT_AUTO_REPLIES.length);
  return SUPPORT_AUTO_REPLIES[i];
}
