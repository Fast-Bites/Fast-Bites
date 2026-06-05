export type WalletTxType = 'deposit' | 'sent' | 'received';
export type WalletTxStatus = 'Received' | 'Successful' | 'Fail';

export interface WalletTransaction {
  id: string;
  type: WalletTxType;
  title: string;
  timeAgo: string;
  amount: number;
  isPositive: boolean;
  status: WalletTxStatus;
}

export const WALLET_TX_ICON_DOWN = '/assets/arrow-down-Recovered.svg';
export const WALLET_TX_ICON_UP = '/assets/arrow-up.png';
export const WALLET_TX_ICON_BANK = '/assets/bank 1.svg';

/** Shown when API returns no transactions (no hardcoded demo rows). */
export const WALLET_TX_EMPTY_MESSAGE = 'No transactions yet. Deposits and transfers will appear here.';

/** Shown when balance could not be loaded from the API. */
export const WALLET_BALANCE_UNAVAILABLE = '—';
