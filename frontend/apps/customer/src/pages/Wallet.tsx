import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { CUSTOMER_ROLE } from '../lib/activeRole';
import { fetchWalletSummary, fetchWalletTransactions } from '../lib/walletApi';
import BottomNav from '../components/BottomNav';
import { responsivePx } from '../constants/responsive';
import { PROFILE_AVATAR_IMAGE } from '../constants/profileAvatar';
import {
  WALLET_BALANCE_UNAVAILABLE,
  WALLET_TX_EMPTY_MESSAGE,
  WALLET_TX_ICON_DOWN,
} from '../constants/walletTransactions';
import type { WalletTransaction } from '../constants/walletTransactions';
import WalletTransactionRow from '../components/WalletTransactionRow';
import WalletDepositFromPanel from '../components/WalletDepositFromPanel';
import OverlayModalBackdropLayer from '../components/OverlayModalBackdropLayer';

interface UserProfile {
  first_name?: string;
  last_name?: string;
  profile_image?: string;
}

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [depositExpanded, setDepositExpanded] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceNote, setBalanceNote] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txNote, setTxNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setBalanceNote(null);
    setTxNote(null);

    const [summaryRes, txRes] = await Promise.all([
      fetchWalletSummary(),
      fetchWalletTransactions(5),
    ]);

    if (summaryRes.error || !summaryRes.summary) {
      setBalance(null);
      setBalanceNote('Balance unavailable — connect to the API or sign in.');
    } else {
      setBalance(summaryRes.summary.balance);
    }

    if (txRes.error) {
      setTransactions([]);
      setTxNote('Transactions unavailable — connect to the API or sign in.');
    } else {
      setTransactions(txRes.transactions);
      if (txRes.transactions.length === 0) {
        setTxNote(WALLET_TX_EMPTY_MESSAGE);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    api.getProfile(CUSTOMER_ROLE).then(({ data }) => {
      if (data) setUser(data as UserProfile);
    });
    loadWallet();
  }, [loadWallet]);

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Guest'
    : 'Guest';

  const balanceDisplay =
    balance !== null ? `₦${balance.toLocaleString()}` : WALLET_BALANCE_UNAVAILABLE;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background pb-28 font-[var(--font-poppins)]">
      <div
        className="absolute inset-x-0 top-0 h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/cart Background.png')" }}
        aria-hidden
      />

      <div
        className={`relative shrink-0 ${responsivePx} pt-10${depositExpanded ? ' z-40' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-foreground/30">
            <img
              src={user?.profile_image || PROFILE_AVATAR_IMAGE}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <p className="text-xs text-foreground/80">Welcome,</p>
            <h2 className="text-base font-semibold text-foreground">{fullName}</h2>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center">
          <p className="text-xs text-foreground/80">Your balance</p>
          <p className="mt-1 text-4xl font-semibold text-foreground">{balanceDisplay}</p>
          {balanceNote ? (
            <p className="mt-2 max-w-xs text-center text-xs text-muted-foreground">{balanceNote}</p>
          ) : null}
        </div>

        <div className="relative">
          <div className="relative mt-12 h-12 w-full">
            {!depositExpanded ? (
              <button
                type="button"
                onClick={() => setDepositExpanded(true)}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-background"
              >
                <span className="absolute left-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <img src={WALLET_TX_ICON_DOWN} alt="" className="h-7 w-7 object-contain" />
                </span>
                <span className="text-lg text-primary">Deposit</span>
              </button>
            ) : (
              <div className="absolute left-0 right-0 top-0">
                <WalletDepositFromPanel
                  onClose={() => setDepositExpanded(false)}
                  onSelectMethod={(method) => {
                    setDepositExpanded(false);
                    navigate('/deposit', { state: { depositMethod: method } });
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/wallet/add-card')}
            className={`mx-auto mt-6 flex items-center gap-2 text-xs text-foreground/80 ${depositExpanded ? 'pointer-events-none invisible' : ''}`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-foreground">
              <Plus className="h-3 w-3 text-foreground" strokeWidth={3} />
            </span>
            <span>Add new card</span>
          </button>
        </div>
      </div>

      {depositExpanded && (
        <div className="pointer-events-auto fixed inset-0 z-[35]" aria-hidden role="presentation">
          <OverlayModalBackdropLayer />
        </div>
      )}

      <div
        className={`relative mt-8 flex flex-1 flex-col rounded-t-3xl bg-[#111111] ${responsivePx} pt-6 pb-6`}
      >
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <h3 className="text-xs text-foreground/90">Transactions</h3>
          <button
            type="button"
            onClick={() => navigate('/wallet/transactions')}
            className="text-xs text-foreground/90"
          >
            See all
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading transactions…</p>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <WalletTransactionRow key={tx.id} tx={tx} variant="card" />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">{txNote ?? WALLET_TX_EMPTY_MESSAGE}</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Wallet;
