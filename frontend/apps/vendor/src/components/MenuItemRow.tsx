import {
  FormCurrencyInput,
  FormField,
  FormSelect,
  FormTextInput,
} from '@/components/FormField';
import { PORTION_SIZE_OPTIONS, type MenuItemDraft } from '@/lib/menuSetup';

export const menuItemIndexClassName = 'pt-10 text-lg font-semibold text-gray-500';

/**
 * Name spans left two tracks; Price is the trailing column.
 * Portion + Duration share Name’s width; Category sits under Price.
 * items-end keeps inputs on one line when “Portion size (optional)” wraps.
 */
export const menuItemGridClassName =
  'grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(10.5rem,13.5rem)]';

interface MenuItemRowProps {
  index: number;
  item: MenuItemDraft;
  onChange: (item: MenuItemDraft) => void;
}

/** One numbered menu item entry block on Menu Setup. */
export default function MenuItemRow({ index, item, onChange }: MenuItemRowProps) {
  const update = (patch: Partial<MenuItemDraft>) => {
    onChange({ ...item, ...patch });
  };

  return (
    <div className="flex gap-3">
      <span className={menuItemIndexClassName}>{index}.</span>
      <div className={`min-w-0 flex-1 ${menuItemGridClassName}`}>
        <FormField label="Name" className="sm:col-span-2">
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

        <FormField label="Portion size" labelNote="(optional)">
          <FormSelect
            value={item.portionSize}
            onChange={(event) => update({ portionSize: event.target.value })}
          >
            <option value="">Select size</option>
            {PORTION_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size} className="text-black">
                {size}
              </option>
            ))}
          </FormSelect>
        </FormField>

        <FormField label="Duration">
          <FormTextInput
            value={item.duration}
            onChange={(event) => update({ duration: event.target.value })}
            placeholder="HH:MM:SS"
          />
        </FormField>

        <FormField label="Category">
          <FormTextInput
            value={item.category}
            onChange={(event) => update({ category: event.target.value })}
          />
        </FormField>
      </div>
    </div>
  );
}
