import api from './api';
import { formatTimeAgo } from './formatTimeAgo';
import type { WalletTransaction, WalletTxStatus, WalletTxType } from '../constants/walletTransactions';

export interface WalletSummary {
  balance: number;
  currency: string;
  hasWallet: boolean;
}

interface WalletSummaryDto {
  balance: number;
  currency: string;
  has_wallet: boolean;
}

interface WalletTransactionDto {
  id: string;
  type: string;
  title: string;
  amount: number;
  is_positive: boolean;
  status: string;
  created_at: string;
}

function mapTransaction(dto: WalletTransactionDto): WalletTransaction {
  return {
    id: dto.id,
    type: dto.type as WalletTxType,
    title: dto.title,
    timeAgo: formatTimeAgo(dto.created_at),
    amount: dto.amount,
    isPositive: dto.is_positive,
    status: dto.status as WalletTxStatus,
  };
}

export async function fetchWalletSummary(): Promise<{
  summary: WalletSummary | null;
  error?: string;
}> {
  const { data, error } = await api.getWalletSummary();
  if (error) return { summary: null, error };
  if (!data) return { summary: null, error: 'No wallet data' };
  const dto = data as WalletSummaryDto;
  return {
    summary: {
      balance: dto.balance,
      currency: dto.currency,
      hasWallet: dto.has_wallet,
    },
  };
}

export async function fetchWalletTransactions(limit = 20): Promise<{
  transactions: WalletTransaction[];
  error?: string;
}> {
  const { data, error } = await api.getWalletTransactions(limit);
  if (error) return { transactions: [], error };
  const list = (data as { transactions?: WalletTransactionDto[] })?.transactions ?? [];
  return { transactions: list.map(mapTransaction) };
}
