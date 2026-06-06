import React, { useState } from 'react';
import { formatCardNumber } from '../lib/formatCardNumber';

export interface PaymentCardFieldErrors {
  cardHolder?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cvv?: string;
}

export interface PaymentCardFieldsProps {
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  onCardHolderChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCvvChange: (value: string) => void;
  errors?: PaymentCardFieldErrors;
  /** Muted styling while errors are demo copy only (no backend yet). */
  errorsArePlaceholder?: boolean;
}

const labelClass = 'text-sm text-muted-foreground';
const borderClass = 'border-b border-white/85';
const inputBaseClass =
  'mt-2 w-full bg-transparent text-lg text-foreground outline-none';
const errorClass = 'mt-1 min-h-[1.125rem] text-xs text-red-500';

function borderOnInput(value: string, focused: boolean): boolean {
  return focused || value.length > 0;
}

function MastercardMark() {
  return (
    <span className="flex shrink-0 items-center" aria-hidden>
      <span className="h-5 w-5 rounded-full bg-[#EB001B]" />
      <span className="-ml-2.5 h-5 w-5 rounded-full bg-[#F79E1B]" />
    </span>
  );
}

function FieldError({
  message,
  placeholder,
}: {
  message?: string;
  placeholder?: boolean;
}) {
  if (!message) return null;
  return (
    <p className={`mt-1 min-h-[1.125rem] text-xs ${placeholder ? 'text-red-500/70' : 'text-red-500'}`}>
      {message}
    </p>
  );
}

interface PaymentCardFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  maxLength?: number;
  formatOnChange?: (value: string) => string;
  inputClassName?: string;
  children?: React.ReactNode;
}

function PaymentCardField({
  id,
  label,
  value,
  onChange,
  error,
  errorPlaceholder,
  inputMode,
  autoComplete,
  maxLength,
  formatOnChange,
  inputClassName = '',
  children,
}: PaymentCardFieldProps & { errorPlaceholder?: boolean }) {
  const [focused, setFocused] = useState(false);
  const active = borderOnInput(value, focused);

  return (
    <div>
      <div className={active ? 'pb-1.5' : `${borderClass} pb-1.5`}>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(formatOnChange ? formatOnChange(e.target.value) : e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${inputBaseClass} ${active ? `${borderClass} pb-1.5` : 'border-0 pb-0'} ${inputClassName}`}
        />
        {children}
      </div>
      <FieldError message={error} placeholder={errorPlaceholder} />
    </div>
  );
}

const PaymentCardFields: React.FC<PaymentCardFieldsProps> = ({
  cardHolder,
  cardNumber,
  cardExpiry,
  cvv,
  onCardHolderChange,
  onCardNumberChange,
  onCardExpiryChange,
  onCvvChange,
  errors,
  errorsArePlaceholder = false,
}) => {
  const digits = cardNumber.replace(/\s/g, '');
  const showBrand = digits.length >= 4;

  return (
    <div className="space-y-6">
      <PaymentCardField
        id="card-holder"
        label="Card Holder"
        value={cardHolder}
        onChange={onCardHolderChange}
        autoComplete="cc-name"
        error={errors?.cardHolder}
        errorPlaceholder={errorsArePlaceholder}
      />

      <PaymentCardField
        id="card-number"
        label="Card Number"
        value={cardNumber}
        onChange={onCardNumberChange}
        inputMode="numeric"
        autoComplete="cc-number"
        maxLength={19}
        formatOnChange={formatCardNumber}
        inputClassName={showBrand ? 'pr-14' : ''}
        error={errors?.cardNumber}
        errorPlaceholder={errorsArePlaceholder}
      >
        {showBrand ? (
          <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
            <MastercardMark />
          </span>
        ) : null}
      </PaymentCardField>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <PaymentCardField
            id="card-expiry"
            label="Card Expiry"
            value={cardExpiry}
            onChange={onCardExpiryChange}
            inputMode="numeric"
            autoComplete="cc-exp"
            maxLength={7}
            error={errors?.cardExpiry}
            errorPlaceholder={errorsArePlaceholder}
          />
        </div>
        <div className="min-w-0 flex-1">
          <PaymentCardField
            id="card-cvv"
            label="CVV"
            value={cvv}
            onChange={(v) => onCvvChange(v.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            autoComplete="cc-csc"
            maxLength={4}
            error={errors?.cvv}
            errorPlaceholder={errorsArePlaceholder}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentCardFields;
