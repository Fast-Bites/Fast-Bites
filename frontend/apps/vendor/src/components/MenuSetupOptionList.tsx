import type { MenuSetupOptionId } from '@/lib/menuSetup';
import { MENU_SETUP_OPTIONS } from '@/lib/menuSetup';

export const menuSetupOptionListClassName = 'flex flex-col gap-4';

export const menuSetupOptionIdleClassName =
  'w-full rounded-full px-4 py-2.5 text-left text-base font-semibold text-gray-900 transition-colors';

export const menuSetupOptionActiveClassName =
  'w-full rounded-lg bg-primary px-4 py-2.5 text-left text-base font-semibold text-white transition-colors';

/** Horizontal gap around the divider (options ← gap → divider ← gap → upload box). Step: mx-4 → mx-5 → mx-6 → mx-8 */
export const menuSetupOptionsDividerClassName = 'mx-6 w-px shrink-0 bg-gray-400';

/** Matches CompactUploadZone height so the divider lines up with the upload tile. */
export const menuSetupUploadMinHeightClassName = 'min-h-[12rem]';

export const menuSetupUploadColumnClassName =
  `flex shrink-0 items-stretch ${menuSetupUploadMinHeightClassName}`;

/** Edit `w-[14rem]` to change upload box width. `max-w-full` lets it shrink on tiny screens. */
export const menuSetupUploadBoxClassName = 'w-[20rem] max-w-full';

interface MenuSetupOptionListProps {
  value: MenuSetupOptionId | null;
  onChange: (option: MenuSetupOptionId) => void;
}

/** Vertical option picker used on Menu Setup (Scan / Upload / Create manually). */
export default function MenuSetupOptionList({ value, onChange }: MenuSetupOptionListProps) {
  return (
    <div className={menuSetupOptionListClassName} role="listbox" aria-label="Upload options">
      {MENU_SETUP_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={selected ? menuSetupOptionActiveClassName : menuSetupOptionIdleClassName}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
