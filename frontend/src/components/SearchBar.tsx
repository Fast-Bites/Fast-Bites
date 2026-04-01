import type { ChangeEvent, FC, InputHTMLAttributes } from 'react';

export interface SearchBarProps {
  /** Extra classes on the outer rounded-full wrapper */
  className?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Forwarded to the input (e.g. aria-label, name, autoFocus) */
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'placeholder' | 'value' | 'defaultValue' | 'onChange' | 'type'>;
}

/**
 * Rounded search field with primary tint and repeating logo pattern (matches Home).
 */
const SearchBar: FC<SearchBarProps> = ({
  className = '',
  placeholder = 'Search',
  value,
  defaultValue,
  onChange,
  inputProps,
}) => {
  const controlled = value !== undefined;

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <div className="absolute inset-0 bg-primary/20" />

      <div
        className="pointer-events-none absolute opacity-20"
        style={{
          width: '800%',
          height: '800%',
          top: '-350%',
          left: '-350%',
          transform: 'rotate(-35deg)',
          backgroundImage: `
                url('/logo/Fast bite transparent I.png'),
                url('/logo/Fast bite transparent I.png')
              `,
          backgroundSize: '20px',
          backgroundRepeat: 'space',
        }}
      />

      <div className="relative flex items-center gap-3 px-4 py-3">
        <img src="/assets/search white.png" alt="" className="h-5 w-5" />
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          {...(controlled ? { value, onChange } : { defaultValue, onChange })}
          {...inputProps}
        />
      </div>
    </div>
  );
};

export default SearchBar;
