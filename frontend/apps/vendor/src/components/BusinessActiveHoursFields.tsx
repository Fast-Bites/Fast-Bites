import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { FormSelect } from '@/components/FormField';

export type Meridiem = 'am' | 'pm';

/** Weekday indexes Mon=0 … Sun=6 — abbreviated labels (no free-text spelling). */
export const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tues' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thurs' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
] as const;

export type WeekdayIndex = (typeof WEEKDAY_OPTIONS)[number]['value'];

export type HoursRangeRow = {
  id: string;
  startDay: WeekdayIndex | '';
  endDay: WeekdayIndex | '';
  openingTime: string;
  openingMeridiem: Meridiem;
  closingTime: string;
  closingMeridiem: Meridiem;
};

export type ActiveHoursValue = {
  ranges: HoursRangeRow[];
};

export type HoursRangePayload = {
  start_day: number;
  end_day: number;
  opening_time: string;
  closing_time: string;
};

function newRangeId() {
  return `hours-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createEmptyHoursRange(): HoursRangeRow {
  return {
    id: newRangeId(),
    startDay: '',
    endDay: '',
    openingTime: '',
    openingMeridiem: 'am',
    closingTime: '',
    closingMeridiem: 'pm',
  };
}

export const DEFAULT_ACTIVE_HOURS: ActiveHoursValue = {
  ranges: [createEmptyHoursRange()],
};

/** Display form always `HH:MM` with zero-padding (12h clock digits). */
function formatTimeDisplay(hours: string, minutes: string): string {
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

/** On blur: force `HH:MM` with zeros for any missing digit. Hours 1–12, minutes 0–59. */
function finalizeTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (!digits) return '';

  let hour = Number(digits.slice(0, Math.min(2, digits.length)) || '0');
  let minute = digits.length > 2 ? Number(digits.slice(2).padEnd(2, '0')) : 0;

  if (!Number.isFinite(hour) || hour < 1) hour = 1;
  if (hour > 12) hour = 12;
  if (!Number.isFinite(minute) || minute < 0) minute = 0;
  if (minute > 59) minute = 59;

  return formatTimeDisplay(String(hour), String(minute));
}

/** Parse a 12h clock string like `9:00` / `09:30` with am/pm → 24h `HH:MM`. */
function to24h(timeRaw: string, meridiem: Meridiem): string | null {
  const finalized = finalizeTimeInput(timeRaw);
  const match = /^(\d{2}):(\d{2})$/.exec(finalized);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;

  hour = hour % 12;
  if (meridiem === 'pm') hour += 12;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function expandDayRange(start: number, end: number): number[] {
  if (start === end) return [start];
  if (start < end) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  // Wrap-around e.g. Fri → Mon
  return [
    ...Array.from({ length: 7 - start }, (_, i) => start + i),
    ...Array.from({ length: end + 1 }, (_, i) => i),
  ];
}

function validateRangeRow(row: HoursRangeRow): string | null {
  if (row.startDay === '' || row.endDay === '') {
    return 'Select working days for each schedule.';
  }
  const opening = to24h(row.openingTime, row.openingMeridiem);
  const closing = to24h(row.closingTime, row.closingMeridiem);
  if (!opening || !closing) {
    return 'Enter valid operating hours (e.g. 9:00 am to 10:00 pm).';
  }
  return null;
}

/**
 * Convert UI ranges → structured hour_ranges for the API.
 * Also returns flattened working_days + first window for older consumers.
 */
export function activeHoursToPayload(value: ActiveHoursValue): {
  hour_ranges: HoursRangePayload[];
  opening_time: string;
  closing_time: string;
  working_days: number[];
} | null {
  if (!value.ranges.length) return null;

  for (const row of value.ranges) {
    if (validateRangeRow(row)) return null;
  }

  const hour_ranges: HoursRangePayload[] = [];
  const daySet = new Set<number>();

  for (const row of value.ranges) {
    const opening_time = to24h(row.openingTime, row.openingMeridiem)!;
    const closing_time = to24h(row.closingTime, row.closingMeridiem)!;
    const start_day = row.startDay as number;
    const end_day = row.endDay as number;
    hour_ranges.push({ start_day, end_day, opening_time, closing_time });
    for (const day of expandDayRange(start_day, end_day)) {
      daySet.add(day);
    }
  }

  if (!hour_ranges.length) return null;

  return {
    hour_ranges,
    opening_time: hour_ranges[0].opening_time,
    closing_time: hour_ranges[0].closing_time,
    working_days: [...daySet].sort((a, b) => a - b),
  };
}

/** Human-readable validation message for step 1. */
export function activeHoursValidationError(value: ActiveHoursValue): string | null {
  if (!value.ranges.length) {
    return 'Add at least one working days and hours schedule.';
  }
  for (const row of value.ranges) {
    const err = validateRangeRow(row);
    if (err) return err;
  }

  // Overlapping days with conflicting times would be confusing for customers
  const claimed = new Map<number, string>();
  for (const row of value.ranges) {
    const opening = to24h(row.openingTime, row.openingMeridiem)!;
    const closing = to24h(row.closingTime, row.closingMeridiem)!;
    const key = `${opening}-${closing}`;
    for (const day of expandDayRange(row.startDay as number, row.endDay as number)) {
      const existing = claimed.get(day);
      if (existing && existing !== key) {
        const label = WEEKDAY_OPTIONS.find((d) => d.value === day)?.label ?? 'A day';
        return `${label} appears in more than one schedule with different hours.`;
      }
      claimed.set(day, key);
    }
  }

  return null;
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
 * Single bordered control: [ HH : MM ] | [ am/pm ]
 * Permanent colon; digits only; hour 01–12; minutes 00–59; missing digits zero-filled on blur.
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
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const alternate: Meridiem = meridiem === 'am' ? 'pm' : 'am';

  const finalized = time.includes(':') ? time : finalizeTimeInput(time);
  const [hourPart = '', minutePart = ''] = finalized.split(':');

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

  const onHourChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    if (!digits) {
      onTimeChange(minutePart ? `:${minutePart}` : '');
      return;
    }

    let hours = digits;
    if (hours.length === 1 && Number(hours) > 1) {
      hours = hours.padStart(2, '0');
    } else if (hours.length === 2) {
      let h = Number(hours);
      if (h === 0) h = 1;
      if (h > 12) h = 12;
      hours = String(h).padStart(2, '0');
    }

    const minutes = minutePart.replace(/\D/g, '').slice(0, 2);
    onTimeChange(minutes ? `${hours}:${minutes}` : `${hours}:`);

    if (hours.length === 2) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const onMinuteChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    const hours = hourPart.replace(/\D/g, '').slice(0, 2);

    if (!digits) {
      onTimeChange(hours ? `${hours}:` : '');
      return;
    }

    let minutes = digits;
    if (minutes.length === 1 && Number(minutes) > 5) {
      minutes = minutes.padStart(2, '0');
    } else if (minutes.length === 2) {
      let m = Number(minutes);
      if (m > 59) m = 59;
      minutes = String(m).padStart(2, '0');
    }

    onTimeChange(`${hours || '0'}:${minutes}`);
  };

  const onHourKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowRight' && (event.currentTarget.selectionStart ?? 0) >= hourPart.length) {
      event.preventDefault();
      minuteRef.current?.focus();
      minuteRef.current?.setSelectionRange(0, 0);
    }
  };

  const onMinuteKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !minutePart) {
      event.preventDefault();
      hourRef.current?.focus();
      const len = hourPart.length;
      hourRef.current?.setSelectionRange(len, len);
      return;
    }
    if (event.key === 'ArrowLeft' && (event.currentTarget.selectionStart ?? 0) === 0) {
      event.preventDefault();
      hourRef.current?.focus();
      const len = hourPart.length;
      hourRef.current?.setSelectionRange(len, len);
    }
  };

  const blurFinalize = () => {
    // Defer so focus moving hour→minute does not finalize mid-edit.
    window.setTimeout(() => {
      const active = document.activeElement;
      if (active === hourRef.current || active === minuteRef.current) return;
      if (!time.trim()) return;
      onTimeChange(finalizeTimeInput(time));
    }, 0);
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <div className="flex w-full items-stretch overflow-hidden rounded-lg border border-gray-400 bg-white transition focus-within:border-primary max-[500px]:rounded-md">
        <div
          className="flex min-w-0 flex-1 items-center justify-center gap-0.5 px-3 py-3 max-[500px]:px-2 max-[500px]:py-2"
          onClick={() => hourRef.current?.focus()}
        >
          <input
            ref={hourRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={hourPart}
            onChange={(event) => onHourChange(event.target.value)}
            onKeyDown={onHourKeyDown}
            onBlur={blurFinalize}
            placeholder="--"
            maxLength={2}
            aria-label={`${ariaLabel} hour`}
            className="w-[2ch] border-0 bg-transparent p-0 text-center text-base text-black outline-none placeholder:text-gray-400 max-[500px]:text-sm"
            required
          />
          <span className="select-none text-base font-medium text-black max-[500px]:text-sm" aria-hidden>
            :
          </span>
          <input
            ref={minuteRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={minutePart}
            onChange={(event) => onMinuteChange(event.target.value)}
            onKeyDown={onMinuteKeyDown}
            onBlur={blurFinalize}
            placeholder="--"
            maxLength={2}
            aria-label={`${ariaLabel} minutes`}
            className="w-[2ch] border-0 bg-transparent p-0 text-center text-base text-black outline-none placeholder:text-gray-400 max-[500px]:text-sm"
            required
          />
        </div>
        <span className="my-auto h-5 w-px shrink-0 bg-gray-700 max-[500px]:h-4" aria-hidden />
        <button
          type="button"
          aria-label={`${ariaLabel} am or pm`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-12 shrink-0 items-center justify-center self-stretch rounded-none border-0 bg-transparent p-0 text-base font-medium lowercase text-primary outline-none max-[500px]:w-10 max-[500px]:text-sm"
        >
          {meridiem}
        </button>
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${ariaLabel} am or pm`}
          className="absolute right-0 top-full z-30 mt-0.5 w-12 rounded-none border border-gray-400 bg-white max-[500px]:w-10"
        >
          <li role="option" aria-selected={false}>
            <button
              type="button"
              onClick={() => {
                onMeridiemChange(alternate);
                setOpen(false);
              }}
              className="flex w-full items-center justify-center rounded-none px-1 py-1.5 text-base font-medium lowercase text-primary max-[500px]:text-sm"
            >
              {alternate}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function DaySelect({
  value,
  onChange,
  'aria-label': ariaLabel,
}: {
  value: WeekdayIndex | '';
  onChange: (day: WeekdayIndex | '') => void;
  'aria-label': string;
}) {
  return (
    <FormSelect
      value={value === '' ? '' : String(value)}
      onChange={(event) => {
        const raw = event.target.value;
        onChange(raw === '' ? '' : (Number(raw) as WeekdayIndex));
      }}
      aria-label={ariaLabel}
      required
    >
      <option value="" disabled>
        Select day
      </option>
      {WEEKDAY_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </FormSelect>
  );
}

/**
 * Working days (abbr. range) + operating hours, with optional extra schedules.
 * Layout per schedule: two columns — days stacked | times stacked.
 */
export default function BusinessActiveHoursFields({
  value,
  onChange,
}: BusinessActiveHoursFieldsProps) {
  const deleteIconSrc = `${import.meta.env.BASE_URL}assets/delete.svg`;

  const patchRange = (id: string, partial: Partial<HoursRangeRow>) => {
    onChange({
      ranges: value.ranges.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    });
  };

  const addRange = () => {
    onChange({ ranges: [...value.ranges, createEmptyHoursRange()] });
  };

  const removeRange = (id: string) => {
    if (value.ranges.length <= 1) return;
    onChange({ ranges: value.ranges.filter((row) => row.id !== id) });
  };

  return (
    <div className="space-y-0 [color-scheme:light]">
      {value.ranges.map((row, index) => {
        const showLabels = index === 0;
        return (
          <div key={row.id} className="flex items-start gap-2 pb-4 sm:gap-3">
            <div
              className={[
                'min-w-0 flex-1',
                index > 0 ? 'border-t border-gray-300 pt-4' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {showLabels ? (
                <div className="mb-2 grid grid-cols-2 gap-3 sm:gap-6">
                  <p className="text-lg text-black max-[500px]:text-sm">
                    <span className="text-red-500" aria-hidden>
                      *{' '}
                    </span>
                    Working Days
                  </p>
                  <p className="text-lg text-black max-[500px]:text-sm">
                    <span className="text-red-500" aria-hidden>
                      *{' '}
                    </span>
                    Operating hours
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-6">
                <DaySelect
                  aria-label={`Schedule ${index + 1} start day`}
                  value={row.startDay}
                  onChange={(startDay) => patchRange(row.id, { startDay })}
                />
                <TimeWithMeridiem
                  aria-label={`Schedule ${index + 1} opening`}
                  time={row.openingTime}
                  meridiem={row.openingMeridiem}
                  onTimeChange={(openingTime) => patchRange(row.id, { openingTime })}
                  onMeridiemChange={(openingMeridiem) =>
                    patchRange(row.id, { openingMeridiem })
                  }
                />

                <span className="text-center text-sm font-medium text-primary" aria-hidden>
                  to
                </span>
                <span className="text-center text-sm font-medium text-primary" aria-hidden>
                  to
                </span>

                <DaySelect
                  aria-label={`Schedule ${index + 1} end day`}
                  value={row.endDay}
                  onChange={(endDay) => patchRange(row.id, { endDay })}
                />
                <TimeWithMeridiem
                  aria-label={`Schedule ${index + 1} closing`}
                  time={row.closingTime}
                  meridiem={row.closingMeridiem}
                  onTimeChange={(closingTime) => patchRange(row.id, { closingTime })}
                  onMeridiemChange={(closingMeridiem) =>
                    patchRange(row.id, { closingMeridiem })
                  }
                />
              </div>
            </div>

            {/* Reserve delete column; button sits on the first field row. */}
            <div
              className={[
                'flex size-9 shrink-0 items-center justify-center',
                index > 0 ? 'pt-4' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {index > 0 ? (
                <button
                  type="button"
                  onClick={() => removeRange(row.id)}
                  className="flex size-9 items-center justify-center rounded-lg text-[#111111]/70 transition hover:bg-black/5 pt-5"
                  aria-label={`Remove schedule ${index + 1}`}
                >
                  <img src={deleteIconSrc} alt="" className="h-5 w-5 object-contain" />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRange}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:opacity-90"
      >
        <span className="flex size-5 items-center justify-center rounded-full border border-primary">
          <Plus size={12} strokeWidth={2.5} />
        </span>
        Add new field
      </button>
    </div>
  );
}
