/**
 * Set to `false` once Add Card uses real API validation errors.
 * While `true`, the form always shows the messages below as a layout reminder.
 */
export const SHOW_PAYMENT_CARD_ERROR_PLACEHOLDERS = true;

/** Placeholder copy until card validation is wired to the backend. */
export const PAYMENT_CARD_PLACEHOLDER_ERRORS = {
  cardHolder: 'Enter the cardholder name',
  cardNumber: 'Incorrect card number',
  cardExpiry: 'Card has expired',
  cvv: 'Card has expired',
} as const;
