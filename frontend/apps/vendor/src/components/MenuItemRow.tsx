import {
  FormCurrencyInput,
  FormField,
  FormSelect,
  FormTextInput,
} from '@/components/FormField';
import type { CatalogCopy } from '@/lib/catalogCopy';
import type { MenuItemDraft } from '@/lib/menuSetup';

export const menuItemIndexClassName =
  'pt-10 text-lg font-semibold text-gray-500 max-[400px]:pt-6 max-[400px]:text-sm';

/**
 * ≤400px: single column.
 * 401–599px: two columns.
 * ≥600px: three columns when size + duration + category all show;
 *          two columns when duration is hidden (Shop / Pharmacy / Market).
 */
export function menuItemGridClassName(copy: CatalogCopy): string {
  const threeCol = copy.showSizeField && copy.showDurationField;
  return [
    'grid items-start gap-x-4 gap-y-4 max-[400px]:gap-2.5',
    'grid-cols-1',
    'min-[401px]:grid-cols-2',
    threeCol ? 'min-[600px]:grid-cols-3' : 'min-[600px]:grid-cols-2',
  ].join(' ');
}

interface MenuItemRowProps {
  index: number;
  item: MenuItemDraft;
  copy: CatalogCopy;
  onChange: (item: MenuItemDraft) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

/** One numbered catalog item entry block on vendor catalog setup. */
export default function MenuItemRow({
  index,
  item,
  copy,
  onChange,
  onRemove,
  canRemove = false,
}: MenuItemRowProps) {
  const update = (patch: Partial<MenuItemDraft>) => {
    onChange({ ...item, ...patch });
  };

  const nameSpanClass = copy.showDurationField
    ? 'min-[600px]:col-span-2'
    : 'min-[600px]:col-span-1';

  return (
    <div className="flex gap-3 max-[400px]:gap-2">
      <span className={menuItemIndexClassName}>{index}.</span>
      <div className={`min-w-0 flex-1 ${menuItemGridClassName(copy)}`}>
        <FormField label="Name" className={nameSpanClass}>
          <FormTextInput
            value={item.name}
            onChange={(event) => update({ name: event.target.value })}
          />
        </FormField>

        <FormField label="Price">
          <FormCurrencyInput
            value={item.price}
            onChange={(event) => update({ price: event.target.value })}
          />
        </FormField>

        {copy.showSizeField ? (
          <FormField label={copy.sizeFieldLabel} labelNote="(optional)">
            <FormSelect
              value={item.portionSize}
              onChange={(event) => update({ portionSize: event.target.value })}
            >
              <option value="">{copy.sizeFieldPlaceholder}</option>
              {copy.sizeOptions.map((size) => (
                <option key={size} value={size} className="text-black">
                  {size}
                </option>
              ))}
            </FormSelect>
          </FormField>
        ) : null}

        {copy.showDurationField ? (
          <FormField
            label={copy.durationFieldLabel}
            labelNote={<span className="invisible">(optional)</span>}
          >
            <FormTextInput
              value={item.duration}
              onChange={(event) => update({ duration: event.target.value })}
              placeholder="HH:MM:SS"
            />
          </FormField>
        ) : null}

        <div className="min-w-0 min-[401px]:col-span-2 min-[600px]:col-span-1">
          <FormField label={copy.categoryFieldLabel} labelNote="(optional)">
            <FormTextInput
              value={item.vendorCategory}
              onChange={(event) => update({ vendorCategory: event.target.value })}
              placeholder={copy.vendorCategoryPlaceholder}
            />
          </FormField>
          <p className="mt-1 text-sm text-gray-400 max-[500px]:text-xs">
            {copy.vendorCategoryHint}
          </p>
        </div>
      </div>

      {canRemove && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Delete item ${index}`}
          className="shrink-0 self-start pt-10 text-gray-500 transition-opacity hover:opacity-70 max-[400px]:pt-6"
        >
          <img src="/assets/delete.svg" alt="" className="h-5 w-5 object-contain" />
        </button>
      ) : null}
    </div>
  );
}
