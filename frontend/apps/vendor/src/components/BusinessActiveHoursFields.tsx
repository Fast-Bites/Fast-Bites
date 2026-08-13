import { useEffect, useId, useRef, useState } from 'react';
import { FormField, FormSelect } from '@/components/FormField';

export type Meridiem = 'am' | 'pm';

export type WorkingDaysPreset =
  | 'everyday'
  | 'weekdays'
  | 'weekends'
  | 'mon-sat';

export interface ActiveHoursValue {
  openingTime: string;
  openingMeridiem: Meridiem;
  closingTime: string;
  closingMeridiem: Meridiem;
  workingDays: WorkingDaysPreset | '';
}

export const DEFAULT_ACTIVE_HOURS: ActiveHoursValue = {
  openingTime: '',
  openingMeridiem: 'am',
  closingTime: '',
  closingMeridiem: 'pm',
  workingDays: '',
};

export const WORKING_DAYS_OPTIONS: { value: WorkingDaysPreset; label: string; days: number[] }[] = [
  { value: 'everyday', label: 'Everyday', days: [0, 1, 2, 3, 4, 5, 6] },
  { value: 'weekdays', label: 'Weekdays (Mon – Fri)', days: [0, 1, 2, 3, 4] },
  { value: 'weekends', label: 'Weekends (Sat – Sun)', days: [5, 6] },
  { value: 'mon-sat', label: 'Monday – Saturday', days: [0, 1, 2, 3, 4, 5] },
];

/** Parse a 12h clock string like `9:00` / `09:30` with am/pm → 24h `HH:MM`. */
function to24h(timeRaw: string, meridiem: Meridiem): string | null {
  const cleaned = timeRaw.trim().replace(/\s/g, '');
  const match = /^(\d{1,2})(?::(\d{2}))?$/.exec(cleaned);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2] != null ? Number(match[2]) : 0;
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;

  hour = hour % 12;
  if (meridiem === 'pm') hour += 12;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Convert UI values to 24h times + open weekday indexes (Mon=0). */
export function activeHoursToPayload(value: ActiveHoursValue): {
  opening_time: string;
  closing_time: string;
  working_days: number[];
} | null {
  const opening_time = to24h(value.openingTime, value.openingMeridiem);
  const closing_time = to24h(value.closingTime, value.closingMeridiem);
  if (!opening_time || !closing_time) return null;

  const preset = WORKING_DAYS_OPTIONS.find((opt) => opt.value === value.workingDays);
  if (!preset) return null;

  return { opening_time, closing_time, working_days: preset.days };
}

/** @deprecated use activeHoursToPayload */
export function activeHoursTo24h(value: ActiveHoursValue): {
  opening_time: string;
  closing_time: string;
} | null {
  const full = activeHoursToPayload(value);
  if (!full) return null;
  return { opening_time: full.opening_time, closing_time: full.closing_time };
}

interface BusinessActiveHoursFieldsProps {
  value: ActiveHoursValue;
  onChange: (next: ActiveHoursValue) => void;
}

/**
 * Single bordered control: [ time ] | [ am/pm ]
 * Dropdown shows only the alternate option (am→pm, pm→am), primary text, with a border.
 */
function TimeWithMeridiem({
  time,
  meridiem,
  onTimeChange,
  onMeridiemChange,
  'aria-label': ariaLabel,
}: {
  time: string;
  meridiem: Meridiem;
  onTimeChange: (time: string) => void;
  onMeridiemChange: (meridiem: Meridiem) => void;
  'aria-label': string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const alternate: Meridiem = meridiem === 'am' ? 'pm' : 'am';

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <div className="flex w-full items-stretch overflow-hidden rounded-lg border border-gray-400 bg-white transition focus-within:border-primary max-[500px]:rounded-md">
        <input
          type="text"
          inputMode="numeric"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          placeholder="--:--"
          aria-label={`${ariaLabel} time`}
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 text-center text-sm text-black outline-none placeholder:text-gray-400 [color-scheme:light] max-[500px]:px-1.5 max-[500px]:py-2 max-[500px]:text-xs"
          required
        />
        <span className="my-auto h-5 w-px shrink-0 bg-gray-300 max-[500px]:h-4" aria-hidden />
        <button
          type="button"
          aria-label={`${ariaLabel} am or pm`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-11 shrink-0 items-center justify-center self-stretch rounded-none border-0 bg-transparent p-0 text-sm font-medium lowercase text-primary outline-none max-[500px]:w-9 max-[500px]:text-xs sm:w-12"
        >
          {meridiem}
        </button>
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${ariaLabel} am or pm`}
          className="absolute right-0 top-full z-30 mt-0.5 w-11 rounded-none border border-gray-400 bg-white max-[500px]:w-9 sm:w-12"
        >
          <li role="option" aria-selected={false}>
            <button
              type="button"
              onClick={() => {
                onMeridiemChange(alternate);
                setOpen(false);
              }}
              className="flex w-full items-center justify-center rounded-none px-1 py-1.5 text-sm font-medium lowercase text-primary max-[500px]:text-xs"
            >
              {alternate}
            </button>
          </li>

        </ul>
      ) : null}
    </div>
  );
}

/**
 * Working days + operating hours on one row (mockup):
 * [Working Days]  [ --:-- | am ] to [ --:-- | pm ]
 */
export default function BusinessActiveHoursFields({
  value,
  onChange,
}: BusinessActiveHoursFieldsProps) {
  const patch = (partial: Partial<ActiveHoursValue>) => onChange({ ...value, ...partial });

  return (
    <div className="grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] items-end gap-3 sm:gap-6 [color-scheme:light]">
      <FormField label="Working Days" required className="min-w-0">
        <FormSelect
          value={value.workingDays}
          onChange={(event) => patch({ workingDays: event.target.value as WorkingDaysPreset | '' })}
          required
        >
          <option value="" disabled>
            Select days
          </option>
          {WORKING_DAYS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </FormSelect>
      </FormField>

      <FormField label="Operating hours" required className="min-w-0">
        <div className="flex w-full min-w-0 flex-nowrap items-center gap-1.5 sm:gap-3">
          <TimeWithMeridiem
            aria-label="Opening"
            time={value.openingTime}
            meridiem={value.openingMeridiem}
            onTimeChange={(openingTime) => patch({ openingTime })}
            onMeridiemChange={(openingMeridiem) => patch({ openingMeridiem })}
          />
          <span className="shrink-0 text-sm font-medium text-primary sm:text-base" aria-hidden>
            to
          </span>
          <TimeWithMeridiem
            aria-label="Closing"
            time={value.closingTime}
            meridiem={value.closingMeridiem}
            onTimeChange={(closingTime) => patch({ closingTime })}
            onMeridiemChange={(closingMeridiem) => patch({ closingMeridiem })}
          />
        </div>
      </FormField>
    </div>
  );
}
