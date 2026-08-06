import type { MenuSetupOptionId } from '@/lib/menuSetup';

export const menuSetupOptionListClassName =
  'flex flex-col gap-4 max-[500px]:gap-2.5';

export const menuSetupOptionIdleClassName =
  'w-full rounded-full px-4 py-2.5 text-left text-base font-semibold text-gray-900 transition-colors max-[500px]:px-2.5 max-[500px]:py-1.5 max-[500px]:text-sm';

export const menuSetupOptionActiveClassName =
  'w-full rounded-lg bg-primary px-4 py-2.5 text-left text-base font-semibold text-white transition-colors max-[500px]:px-2.5 max-[500px]:py-1.5 max-[500px]:text-sm';

/** Horizontal gap around the divider (options ← gap → divider ← gap → upload box). */
export const menuSetupOptionsDividerClassName =
  'mx-6 w-px shrink-0 bg-gray-400 max-[500px]:mx-2.5';

/** Matches CompactUploadZone height so the divider lines up with the upload tile. */
export const menuSetupUploadMinHeightClassName =
  'min-h-[12rem] max-[500px]:min-h-[8.5rem]';

/** Grows/shrinks with the row; `min-w-0` lets the upload tile compress on narrow screens. */
export const menuSetupUploadColumnClassName = [
  'flex min-w-0 flex-1 items-stretch',
  menuSetupUploadMinHeightClassName,
].join(' ');

/** Caps preferred width but always allows shrinking below that. */
export const menuSetupUploadBoxClassName =
  'w-full min-w-0 max-w-[20rem] max-[500px]:max-w-[12.5rem]';

export const menuSetupOptionsRowClassName =
  'my-6 flex min-w-0 items-center gap-0 max-[500px]:my-4';

export const menuSetupOptionsListWrapClassName =
  'my-2 w-[42%] shrink-0 sm:w-48 max-[500px]:w-[min(42%,9.5rem)] max-[500px]:my-1';

export type MenuSetupOptionDef = {
  id: MenuSetupOptionId;
  label: string;
};

interface MenuSetupOptionListProps {
  value: MenuSetupOptionId | null;
  options: readonly MenuSetupOptionDef[];
  onChange: (option: MenuSetupOptionId) => void;
}

/** Vertical option picker used on catalog setup (Scan / Upload / Create manually). */
export default function MenuSetupOptionList({ value, options, onChange }: MenuSetupOptionListProps) {
  return (
    <div className={menuSetupOptionListClassName} role="listbox" aria-label="Upload options">
      {options.map((option) => {
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
