import React from 'react';
import BankTransferMethodRow from './BankTransferMethodRow';

const CREDIT_ICON = '/assets/credit-card 1.svg';

export interface WalletDepositFromPanelProps {
  onClose: () => void;
  onSelectMethod: (method: 'card' | 'bank') => void;
}

/**
 * Inline “Deposit from” block for Wallet — expands in place under the deposit control
 * (no full-screen overlay). Does not use `OverlayChoiceModal`.
 */
const WalletDepositFromPanel: React.FC<WalletDepositFromPanelProps> = ({
  onClose,
  onSelectMethod
}) => {
  return (
    <div
      className="w-full rounded-3xl border border-white/15 bg-black p-5 shadow-lg"
      role="region"
      aria-labelledby="deposit-from-title"
    >
      <div className="mb-3 flex w-full justify-start">
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary"
          aria-label="Close"
        >
          <img src="/assets/menu close 2.svg" alt="" className="h-4 w-4" />
        </button>
      </div>

      <p id="deposit-from-title" className="mb-10 text-center text-lg font-normal text-foreground">
        Deposit from
      </p>

      <div className="flex flex-col gap-4 mb-10">
        <button
          type="button"
          onClick={() => onSelectMethod('card')}
          className="flex w-full items-center gap-3 rounded-lg bg-overlay-panel-background p-2 text-left font-normal transition-opacity hover:opacity-90 active:opacity-80"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
            <img src={CREDIT_ICON} alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="text-lg font-normal text-foreground">Card</span>
        </button>

        <BankTransferMethodRow
          onPress={() => onSelectMethod('bank')}
          labelClassName="text-lg font-normal text-foreground"
        />
      </div>
    </div>
  );
};

export default WalletDepositFromPanel;
