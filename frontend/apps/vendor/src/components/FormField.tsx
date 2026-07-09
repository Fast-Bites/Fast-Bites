import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export const formFieldWrapperClassName = 'block space-y-3 bg-transparent';

export const formLabelClassName = 'text-lg font-regular text-black';

export const formInputClassName =
  'mt-2 w-full rounded-lg border border-gray-400 bg-white px-5 py-3 text-base text-black outline-none transition placeholder:text-gray-400 focus:border-primary [background-color:#fff] [color-scheme:light]';

export const formHintClassName = 'bg-transparent text-sm text-gray-400';

export const formLabelNoteClassName = 'text-sm font-regular text-gray-400';

interface FormFieldProps {
  label: string;
  labelNote?: string;
  required?: boolean;
  children: ReactNode;
  hint?: ReactNode;
}

export function FormField({ label, labelNote, required = false, children, hint }: FormFieldProps) {
  return (
    <label className={formFieldWrapperClassName}>
      <span className={formLabelClassName}>
        {required ? (
          <span className="text-red-500" aria-hidden="true">
            *{' '}
          </span>
        ) : null}
        {label}
        {labelNote ? <span className={formLabelNoteClassName}> {labelNote}</span> : null}
      </span>
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

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function FormSelect({ className, children, ...props }: FormSelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={
          className
            ? `${formInputClassName} appearance-none ${className}`
            : `${formInputClassName} appearance-none`
        }
      >
        {children}
      </select>
      <ChevronDown
        size={20}
        className="pointer-events-none absolute right-5 top-1/2 mt-1 -translate-y-1/2 text-gray-400"
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
