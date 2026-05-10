import React from 'react';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import WalletTransactionRow from '../components/WalletTransactionRow';
import { WALLET_TRANSACTIONS } from '../constants/walletTransactions';
import { responsivePx } from '../constants/responsive';

/**
 * Full transaction history — same rows as Wallet, list dividers instead of cards.
 */
const WalletTransactions: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-background pb-28 font-[var(--font-poppins)]">
      <div className={`absolute top-0 left-0 right-0 z-[50] ${responsivePx} pt-10`}>
        <BackButton variant="map" title="Transactions" to="/wallet" />
      </div>
      <div className="h-20" />

      <div className={`${responsivePx} mt-6`}>
        <ul className="border-b border-white/50 divide-y divide-white/50">
          {WALLET_TRANSACTIONS.map((tx) => (
            <li key={tx.id} className="py-3">
              <WalletTransactionRow tx={tx} variant="lined" />
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
    </div>
  );
};

export default WalletTransactions;
