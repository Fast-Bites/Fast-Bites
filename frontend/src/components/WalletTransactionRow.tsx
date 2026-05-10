import React from 'react';
import type { WalletTransaction, WalletTxType } from '../constants/walletTransactions';
import {
  WALLET_TX_ICON_BANK,
  WALLET_TX_ICON_DOWN,
  WALLET_TX_ICON_UP,
} from '../constants/walletTransactions';

function renderTxIcon(type: WalletTxType) {
  if (type === 'sent') {
    return <img src={WALLET_TX_ICON_UP} alt="" className="h-7 w-7 object-contain" />;
  }
  if (type === 'received') {
    return <img src={WALLET_TX_ICON_DOWN} alt="" className="h-7 w-7 object-contain" />;
  }
  return <img src={WALLET_TX_ICON_BANK} alt="" className="h-6 w-6 object-contain" />;
}

function amountClass(tx: WalletTransaction): string {
  if (tx.status === 'Fail') return 'text-red-500';
  if (tx.isPositive) return 'text-popup-green';
  return 'text-foreground';
}

function statusClass(tx: WalletTransaction): string {
  if (tx.status === 'Fail') return 'text-red-500';
  if (tx.status === 'Received') return 'text-foreground/80';
  return 'text-popup-green';
}

interface WalletTransactionRowProps {
  tx: WalletTransaction;
  /** Card = wallet home list; lined = full history (dividers only, no panel fill). */
  variant: 'card' | 'lined';
}

const WalletTransactionRow: React.FC<WalletTransactionRowProps> = ({ tx, variant }) => {
  const inner = (
    <>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
        {renderTxIcon(tx.type)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{tx.title}</p>
        <p className="text-xs text-muted-foreground/80">{tx.timeAgo}</p>
      </div>

      <div className="flex flex-col items-end">
        <span className={`text-sm ${amountClass(tx)}`}>
          {tx.isPositive ? '+ ' : '- '}
          {tx.amount.toLocaleString()} NGN
        </span>
        <span className={`text-xs ${statusClass(tx)}`}>{tx.status}</span>
      </div>
    </>
  );

  if (variant === 'card') {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-overlay-panel-background p-2">{inner}</div>
    );
  }

  return <div className="flex items-center gap-3">{inner}</div>;
};

export default WalletTransactionRow;
