import React from 'react';

const BANK_ICON = '/assets/bank 1.svg';
const FORWARD_ICON = '/assets/Back.svg';
export interface BankTransferMethodRowProps {
  /** Label next to the icon (e.g. "Bank transfer"). */
  label?: string;
  /** Must match the line that introduces the row (e.g. `Transfer using:`) on deposit screens. */
  labelClassName?: string;
  className?: string;
  /** When set, renders as a button (wallet picker). Otherwise a static row (deposit review). */
  onPress?: () => void;
}

/**
 * Shared “Bank transfer” row: same shell as the wallet deposit-from option.
 */
const BankTransferMethodRow: React.FC<BankTransferMethodRowProps> = ({
  label = 'Bank transfer',
  labelClassName = 'text-lg font-normal text-foreground',
  className = '',
  onPress
}) => {
  const inner = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Bank icon box size: outer `h-11 w-11`; icon asset size: inner `h-7 w-7` */}
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
          <img src={BANK_ICON} alt="" className="h-7 w-7 object-contain" />
        </span>
        <span className={`min-w-0 ${labelClassName}`}>{label}</span>
      </div>
      <img
        src={FORWARD_ICON}
        alt=""
        className="h-5 w-5 shrink-0 object-contain [transform:rotate(180deg)]"
        aria-hidden
      />
    </>
  );

  const shellClass = `flex w-full items-center justify-between rounded-lg bg-overlay-panel-background p-3 ${className}`;

  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={`${shellClass} text-left font-normal transition-opacity hover:opacity-90 active:opacity-80`}>
        {inner}
      </button>
    );
  }

  return <div className={shellClass}>{inner}</div>;
};

export default BankTransferMethodRow;
