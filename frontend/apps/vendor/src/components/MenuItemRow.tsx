import {
  FormCurrencyInput,
  FormField,
  FormTextInput,
} from '@/components/FormField';
import type { CatalogCopy } from '@/lib/catalogCopy';
import type { MenuItemDraft } from '@/lib/menuSetup';

export const menuItemIndexClassName =
  'w-7 shrink-0 text-center text-lg font-semibold text-gray-500 max-[400px]:w-6 max-[400px]:text-sm';

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

  const fieldGridClassName = [
    'grid min-w-0 flex-1 items-start gap-x-4 gap-y-4',
    'grid-cols-1 min-[401px]:grid-cols-2',
    'max-[400px]:gap-2.5',
  ].join(' ');

  const deleteButton = canRemove && onRemove ? (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Delete item ${index}`}
      className="shrink-0 text-gray-500 transition-opacity hover:opacity-70"
    >
      <img src="/assets/delete.svg" alt="" className="h-5 w-5 object-contain" />
    </button>
  ) : null;

  /** Matches index column width so lower rows line up with Name/Price. */
  const indexSpacer = <span className={menuItemIndexClassName} aria-hidden />;
  /** Matches delete button width when present. */
  const deleteSpacer = canRemove ? <span className="inline-block h-5 w-5 shrink-0" aria-hidden /> : null;

  return (
    <div className="flex flex-col gap-4 max-[400px]:gap-2.5">
      {/* Index centered with the Name + Price row */}
      <div className="flex items-center gap-3 max-[400px]:gap-2">
        <span className={menuItemIndexClassName}>{index}.</span>
        <div className={fieldGridClassName}>
          <FormField label="Name">
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
        </div>
        {deleteButton}
      </div>

      {/* Duration + Category share the full row (no leftover size column) */}
      <div className="flex items-start gap-3 max-[400px]:gap-2">
        {indexSpacer}
        <div className={fieldGridClassName}>
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

          <FormField
            label={copy.categoryFieldLabel}
            labelNote="(optional)"
            className={copy.showDurationField ? undefined : 'min-[401px]:col-span-2'}
          >
            <FormTextInput
              value={item.vendorCategory}
              onChange={(event) => update({ vendorCategory: event.target.value })}
              placeholder={copy.vendorCategoryPlaceholder}
            />
          </FormField>
        </div>
        {deleteSpacer}
      </div>
    </div>
  );
}
