import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import {
  FormCurrencyInput,
  FormField,
  FormSelect,
  FormTextInput,
} from '@/components/FormField';
import UploadField from '@/components/UploadField';
import {
  addRestaurantMenuItem,
  fileToDataUrl,
  getRestaurantMenuItem,
  updateRestaurantMenuItem,
  type MenuCategory,
} from '@/lib/restaurantMenuStore';
import { MAX_IMAGE_UPLOAD_BYTES } from '@/lib/uploadLimits';

const CATEGORIES = ['Food', 'Drinks', 'Desserts', 'Sides'] as const satisfies readonly MenuCategory[];
type Category = MenuCategory;

const PROTEINS = ['Beef', 'Chicken', 'Fried fish', 'Goat meat', 'Turkey'] as const;
const EXTRAS = ['Boiled egg', 'Fried plantain', 'Coleslaw', 'Salad'] as const;

function showsDuration(category: Category) {
  return category !== 'Drinks';
}

function showsAccompaniments(category: Category) {
  return category === 'Food';
}

export default function RestaurantAddMenu() {
  const navigate = useNavigate();
  const { menuId } = useParams<{ menuId?: string }>();
  const isEditing = Boolean(menuId);

  const [category, setCategory] = useState<Category>('Food');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [accompaniments, setAccompaniments] = useState(true);
  const [protein, setProtein] = useState('');
  const [extra, setExtra] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const withDuration = showsDuration(category);
  const withAccompaniments = showsAccompaniments(category);

  useEffect(() => {
    if (!menuId) return;
    const existing = getRestaurantMenuItem(menuId);
    if (!existing) {
      setNotFound(true);
      return;
    }
    setCategory(existing.category);
    setName(existing.name);
    setPrice(existing.price.replace(/[^\d.]/g, ''));
    setDuration(existing.duration);
    setProtein(existing.protein);
    setExtra(existing.extra);
    setAccompaniments(showsAccompaniments(existing.category));
    setImagePreview(existing.image);
    setImageFile(null);
    setNotFound(false);
  }, [menuId]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleCategoryChange = (value: string) => {
    const next = value as Category;
    setCategory(next);
    if (!showsDuration(next)) {
      setDuration('');
    }
    if (!showsAccompaniments(next)) {
      setAccompaniments(false);
      setProtein('');
      setExtra('');
    } else {
      setAccompaniments(true);
    }
  };

  const handleImageSelect = (file: File | null) => {
    setImageError(null);
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    if (!file) {
      // Keep existing saved image when clearing a new pick during edit;
      // only clear preview if there was never a stored image.
      if (isEditing && menuId) {
        const existing = getRestaurantMenuItem(menuId);
        setImagePreview(existing?.image ?? null);
        return;
      }
      setImagePreview(null);
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const nextImage = imageFile
        ? await fileToDataUrl(imageFile)
        : imagePreview && !imagePreview.startsWith('blob:')
          ? imagePreview
          : null;

      const payload = {
        category,
        name: name.trim(),
        price: price.trim(),
        duration: withDuration ? duration.trim() : '',
        protein: withAccompaniments && accompaniments ? protein : '',
        extra: withAccompaniments && accompaniments ? extra : '',
        image: nextImage,
      };

      if (isEditing && menuId) {
        const updated = updateRestaurantMenuItem(menuId, payload);
        if (!updated) {
          setNotFound(true);
          setSaving(false);
          return;
        }
      } else {
        addRestaurantMenuItem(payload);
      }
      navigate('/menu');
    } catch {
      setImageError('Could not save menu image. Try again.');
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-16 text-center">
        <p className="text-base text-[#6a6a6a]">Menu item not found.</p>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="rounded-lg bg-[#00af00] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-4 pb-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-xl rounded-[12px] bg-white p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[22px] font-bold text-[#111111]">
            {isEditing ? 'Edit menu' : 'Create a menu'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="flex size-10 items-center justify-center rounded-full bg-[#ff2c2c] text-white"
              aria-label="Cancel"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex size-10 items-center justify-center rounded-full bg-[#00af00] text-white disabled:opacity-60"
              aria-label={isEditing ? 'Save changes' : 'Save menu'}
            >
              <Check size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <FormField label="Category" required>
            <FormSelect
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <UploadField
            label="Menu image"
            accept="image/*"
            maxBytes={MAX_IMAGE_UPLOAD_BYTES}
            previewUrl={imagePreview}
            error={imageError}
            onFileSelect={handleImageSelect}
            onValidationError={setImageError}
          />

          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2">
            <FormField label="Name" required>
              <FormTextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Price" required>
              <FormCurrencyInput
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </FormField>
          </div>

          {withDuration ? (
            <FormField label="Duration">
              <FormTextInput
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="HH:MM:SS"
              />
            </FormField>
          ) : null}

          {withAccompaniments ? (
            <>
              <div className="flex items-center gap-3">
                <label className="flex shrink-0 items-center gap-2 text-base text-[#111111]">
                  <input
                    type="checkbox"
                    checked={accompaniments}
                    onChange={(e) => setAccompaniments(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Accompaniments
                </label>
                <span className="h-px min-w-0 flex-1 bg-[#c0c0c0]" aria-hidden />
              </div>

              {accompaniments ? (
                <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                  <FormField label="Protein" labelNote="(optional)">
                    <FormSelect
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                    >
                      <option value="">Select proteins</option>
                      {PROTEINS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>
                  <FormField label="Extra" labelNote="(optional)">
                    <FormSelect
                      value={extra}
                      onChange={(e) => setExtra(e.target.value)}
                    >
                      <option value="">Select extras</option>
                      {EXTRAS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}
