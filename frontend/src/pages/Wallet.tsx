import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import BottomNav from '../components/BottomNav';
import { responsivePx } from '../constants/responsive';
import { PROFILE_AVATAR_IMAGE } from '../constants/profileAvatar';
import { WALLET_TRANSACTIONS, WALLET_TX_ICON_DOWN } from '../constants/walletTransactions';
import WalletTransactionRow from '../components/WalletTransactionRow';
import WalletDepositFromPanel from '../components/WalletDepositFromPanel';
import OverlayModalBackdropLayer from '../components/OverlayModalBackdropLayer';

interface UserProfile {
  first_name?: string;
  last_name?: string;
  /** If API returns a custom photo, use it; otherwise same default as Home. */
  profile_image?: string;
}

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [depositExpanded, setDepositExpanded] = useState(false);
  const balance = 23600;

  useEffect(() => {
    api.getProfile().then(({ data }) => {
      if (data) setUser(data as UserProfile);
    });
  }, []);

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'John Doe'
    : 'John Doe';

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background pb-28 font-[var(--font-poppins)]">
      {/* Orange wallet background — covers ~3/5 */}
      <div
        className="absolute inset-x-0 top-0 h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/cart Background.png')" }}
        aria-hidden
      />

      <div
        className={`relative shrink-0 ${responsivePx} pt-10${depositExpanded ? ' z-40' : ''}`}
      >
        {/* User greeting */}
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

        {/* Balance */}
        <div className="mt-14 flex flex-col items-center">
          <p className="text-xs text-foreground/80">Your balance</p>
          <p className="mt-1 text-4xl font-semibold text-foreground">
            ₦{balance.toLocaleString()}
          </p>
        </div>

        {/* Deposit — expanded panel is absolute so flow below does not shift */}
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

          {/* Add new card — keep layout space when expanded so nothing below moves */}
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

      {/* Transactions panel — flex-1 so #111111 fills viewport below the cards */}
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

        <div className="space-y-3">
          {WALLET_TRANSACTIONS.map((tx) => (
            <WalletTransactionRow key={tx.id} tx={tx} variant="card" />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Wallet;
