import { Fragment, useRef, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import Button from '@/components/Button';

const verifyBackgroundUrl = `${import.meta.env.BASE_URL}assets/Admin bg.png`;

const STEPS = [1, 2, 3, 4];

const BUSINESS_TYPES = [
  'Restaurant',
  'Shop',
  'Pharmacy',
  // 'Bar',
  'Market',
];

const inputClassName =
  'mt-2 w-full rounded-lg border border-gray-400 bg-white px-5 py-3 text-base text-black outline-none transition placeholder:text-gray-400 focus:border-primary [background-color:#fff] [color-scheme:light]';

const UPLOAD_BORDER_DASH = '10 10'; // dash length, gap length (adjust for longer/shorter dashes)

const MIN_DESCRIPTION_WORDS = 300;

function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function UploadField({
  label,
  onFileSelect,
}: {
  label: string;
  onFileSelect: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="mb-1 text-lg font-regular text-black">{label}</p>
      <div className="relative rounded-xl">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-white px-5 py-12 transition hover:bg-white"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/25 text-primary">
            <Plus size={46} strokeWidth={1.0} />
          </span>
          <span className="text-sm text-gray-400">Click to upload</span>
        </button>
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect
            width="100%"
            height="100%"
            rx="12"
            ry="12"
            fill="none"
            className="stroke-primary"
            strokeWidth="3"
            strokeDasharray={UPLOAD_BORDER_DASH}
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function RegistrationStepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="mx-auto mt-7 mb-10 flex w-full max-w-[100%] items-center sm:max-w-[65%]">
      {STEPS.map((step, index) => (
        <Fragment key={step}>
          <div
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-semibold',
              step === activeStep
                ? 'bg-primary text-white'
                : 'border border-gray-400 bg-transparent text-gray-400',
            ].join(' ')}
          >
            {step}
          </div>
          {index < STEPS.length - 1 ? (
            <div className="mx-1 h-px min-w-2 flex-1 bg-gray-400" />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

export default function VerifyBusiness() {
  const [businessName, setBusinessName] = useState('');
  const [businessOwner, setBusinessOwner] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const wordCount = countWords(description);

  const handleNext = () => {
    // Step 2+ and API wiring will be added later.
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat px-4 py-12 sm:px-8 sm:py-12"
      style={{ backgroundImage: `url("${verifyBackgroundUrl}")` }}
    >
      <div className="mx-auto w-full max-w-6xl bg-transparent sm:px-12 sm:py-2">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-gray-900">Details</h1>
          <p className="mt-3 text-base text-gray-600">Register to get your business onboard</p>
        </div>

        <RegistrationStepper activeStep={1} />

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Business information</h2>
          <p className="text-base text-gray-600">
            Provide the basic information to get started with us.
          </p>
          <hr className="mt-1 mb-6 border-gray-400" />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleNext();
            }}
            className="space-y-6 [color-scheme:light]"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-3 bg-transparent">
                <span className="text-lg font-regular text-black">Business name</span>
                <input
                  type="text"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="All You Can Eat"
                  className={inputClassName}
                />
              </label>

              <label className="block space-y-3 bg-transparent">
                <span className="text-lg font-regular text-black">Business Owner</span>
                <input
                  type="text"
                  value={businessOwner}
                  onChange={(event) => setBusinessOwner(event.target.value)}
                  placeholder="John Doe"
                  className={inputClassName}
                />
              </label>
            </div>

            <label className="block space-y-3 bg-transparent">
              <span className="text-lg font-regular text-black">Business Type</span>
              <div className="relative">
                <select
                  value={businessType}
                  onChange={(event) => setBusinessType(event.target.value)}
                  className={`${inputClassName} appearance-none`}
                >
                  <option value="" disabled className="text-gray-400">
                    Restaurant
                  </option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  className="mt-1 pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </label>

            <label className="block space-y-3 bg-transparent">
              <span className="text-lg font-regular text-black">Description</span>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Not less than 300 words"
                className={inputClassName}
              />
              <p className="bg-transparent text-sm text-gray-400" aria-live="polite">
                {wordCount} / {MIN_DESCRIPTION_WORDS}
              </p>
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <UploadField label="Logo" onFileSelect={() => undefined} />
              <UploadField label="Cover Image" onFileSelect={() => undefined} />
            </div>

            <Button type="submit" variant="primary" className="mt-5">
              Next
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
