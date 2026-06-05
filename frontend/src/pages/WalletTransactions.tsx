import React, { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import WalletTransactionRow from '../components/WalletTransactionRow';
import { WALLET_TX_EMPTY_MESSAGE } from '../constants/walletTransactions';
import type { WalletTransaction } from '../constants/walletTransactions';
import { fetchWalletTransactions } from '../lib/walletApi';
import { responsivePx } from '../constants/responsive';

const WalletTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { transactions: rows, error } = await fetchWalletTransactions(50);
      if (cancelled) return;
      if (error) {
        setTransactions([]);
        setNote('Transactions unavailable — connect to the API or sign in.');
      } else if (rows.length === 0) {
        setTransactions([]);
        setNote(WALLET_TX_EMPTY_MESSAGE);
      } else {
        setTransactions(rows);
        setNote(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-background pb-28 font-[var(--font-poppins)]">
      <div className={`absolute top-0 left-0 right-0 z-[50] ${responsivePx} pt-10`}>
        <BackButton variant="map" title="Transactions" to="/wallet" />
      </div>
      <div className="h-20" />

      <div className={`${responsivePx} mt-6`}>
        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading transactions…</p>
        ) : transactions.length > 0 ? (
          <ul className="divide-y divide-white/50 border-b border-white/50">
            {transactions.map((tx) => (
              <li key={tx.id} className="py-3">
                <WalletTransactionRow tx={tx} variant="lined" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {note ?? WALLET_TX_EMPTY_MESSAGE}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default WalletTransactions;
