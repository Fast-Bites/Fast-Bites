import React from 'react';

const CREDIT_ICON = '/assets/credit-card 1.svg';
const FORWARD_ICON = '/assets/Back.svg';

export interface CreditCardMethodRowProps {
  label?: string;
  labelClassName?: string;
  className?: string;
  onPress?: () => void;
}

/** Same shell as `BankTransferMethodRow` — Card option for deposit method switching. */
const CreditCardMethodRow: React.FC<CreditCardMethodRowProps> = ({
  label = 'Card',
  labelClassName = 'text-lg font-normal text-foreground',
  className = '',
  onPress
}) => {
  const inner = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
          <img src={CREDIT_ICON} alt="" className="h-7 w-7 object-contain" />
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
      <button
        type="button"
        onClick={onPress}
        className={`${shellClass} text-left font-normal transition-opacity hover:opacity-90 active:opacity-80`}
      >
        {inner}
      </button>
    );
  }

  return <div className={shellClass}>{inner}</div>;
};

export default CreditCardMethodRow;
