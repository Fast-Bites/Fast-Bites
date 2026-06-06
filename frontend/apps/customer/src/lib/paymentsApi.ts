import api from './api';

export interface DepositAccountInfo {
  owner_name: string;
  wallet_id: string;
  gateway: string;
  account_number: string;
  bank_name?: string;
  recipient_name?: string;
}

export function parseCardExpiry(expiry: string): { exp_month: number; exp_year: number } | null {
  const cleaned = expiry.replace(/\s/g, '');
  const parts = cleaned.split(/[/\-]/).filter(Boolean);
  if (parts.length < 2) return null;
  const exp_month = parseInt(parts[0], 10);
  let exp_year = parseInt(parts[1], 10);
  if (Number.isNaN(exp_month) || Number.isNaN(exp_year)) return null;
  if (exp_year < 100) exp_year += 2000;
  if (exp_month < 1 || exp_month > 12) return null;
  return { exp_month, exp_year };
}

export async function savePaymentCard(payload: {
  cardholder_name: string;
  card_number: string;
  exp_month: number;
  exp_year: number;
  save_details: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await api.createPaymentCard(payload);
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function fetchDepositAccount(): Promise<{
  account: DepositAccountInfo | null;
  error?: string;
}> {
  const { data, error } = await api.getDepositAccount();
  if (error) return { account: null, error };
  if (!data) return { account: null, error: 'No deposit account configured' };
  return { account: data as DepositAccountInfo };
}

export async function createDeposit(
  method: 'bank' | 'card',
  amount: number,
): Promise<{ ok: boolean; balance?: number; error?: string }> {
  const { data, error } = await api.createDeposit({ method, amount });
  if (error) return { ok: false, error };
  const balance = (data as { balance?: number } | undefined)?.balance;
  return { ok: true, balance };
}
