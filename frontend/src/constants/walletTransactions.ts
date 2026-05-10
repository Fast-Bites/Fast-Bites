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

/** Demo list — same source for Wallet preview and full history. */
export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: '1', type: 'deposit', title: 'Deposit', timeAgo: '5 mins. ago', amount: 5600, isPositive: true, status: 'Received' },
  { id: '2', type: 'sent', title: 'Sent', timeAgo: '23 mins. ago', amount: 2000, isPositive: false, status: 'Successful' },
  { id: '3', type: 'received', title: 'Received', timeAgo: '15 mins. ago', amount: 2000, isPositive: true, status: 'Successful' },
  { id: '4', type: 'deposit', title: 'Deposit', timeAgo: '2 hrs. ago', amount: 18000, isPositive: true, status: 'Received' },
  { id: '5', type: 'deposit', title: 'Deposit', timeAgo: '2 hrs. ago', amount: 18000, isPositive: true, status: 'Fail' },
];
