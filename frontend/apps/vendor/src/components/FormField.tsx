import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export const formFieldWrapperClassName =
  'block space-y-2 bg-transparent max-[500px]:space-y-1.5';

export const formLabelClassName =
  'text-lg font-regular text-black max-[500px]:text-sm';

export const formInputClassName =
  'w-full rounded-lg border border-gray-400 bg-white px-5 py-3 text-base text-black outline-none transition placeholder:text-gray-400 focus:border-primary [background-color:#fff] [color-scheme:light] max-[500px]:rounded-md max-[500px]:px-3 max-[500px]:py-2 max-[500px]:text-sm';

export const formHintClassName = 'bg-transparent text-sm text-gray-400 max-[500px]:text-xs';

export const formLabelNoteClassName =
  'text-sm font-regular text-gray-400 max-[500px]:text-xs';

interface FormFieldProps {
  label: string;
  labelNote?: ReactNode;
  required?: boolean;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export function FormField({
  label,
  labelNote,
  required = false,
  children,
  hint,
  className,
}: FormFieldProps) {
  return (
    <label
      className={[formFieldWrapperClassName, className].filter(Boolean).join(' ')}
    >
      {label ? (
        <span className={formLabelClassName}>
          {required ? (
            <span className="text-red-500" aria-hidden="true">
              *{' '}
            </span>
          ) : null}
          {label}
          {labelNote ? <span className={formLabelNoteClassName}> {labelNote}</span> : null}
        </span>
      ) : null}
      {children}
      {hint}
    </label>
  );
}

export function FormTextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={className ? `${formInputClassName} ${className}` : formInputClassName}
    />
  );
}

interface FormCurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  currencySymbol?: string;
}

/** Price input with ₦ prefix separated by a light vertical divider. */
export function FormCurrencyInput({
  className,
  currencySymbol = '₦',
  ...props
}: FormCurrencyInputProps) {
  return (
    <div
      className={[
        'flex w-full items-center overflow-hidden rounded-lg border border-gray-400 bg-white transition focus-within:border-primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="flex shrink-0 items-center px-3 text-base text-gray-400 max-[500px]:px-2 max-[500px]:text-sm" aria-hidden>
        {currencySymbol}
      </span>
      <span className="h-6 w-[2px] shrink-0 bg-gray-400 max-[500px]:h-5" aria-hidden />
      <input
        {...props}
        type="text"
        inputMode="decimal"
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-base text-black outline-none placeholder:text-gray-400 [background-color:#fff] [color-scheme:light] max-[500px]:px-2 max-[500px]:py-2 max-[500px]:text-sm"
      />
    </div>
  );
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function FormSelect({ className, children, value, ...props }: FormSelectProps) {
  const isPlaceholder = value === '' || value === undefined || value === null;

  return (
    <div className="relative">
      <select
        {...props}
        value={value}
        className={[
          formInputClassName,
          'appearance-none',
          isPlaceholder ? 'text-gray-400' : 'text-black',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </select>
      <ChevronDown
        size={20}
        className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

interface FormFieldHintProps {
  children: ReactNode;
}

export function FormFieldHint({ children }: FormFieldHintProps) {
  return (
    <p className={formHintClassName} aria-live="polite">
      {children}
    </p>
  );
}
