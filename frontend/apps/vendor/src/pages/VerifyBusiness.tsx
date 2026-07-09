import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FormField,
  FormSelect,
  FormTextInput,
} from '@/components/FormField';
import {
  RegistrationPageHeader,
  RegistrationSectionHeader,
  RegistrationStepFooter,
} from '@/components/RegistrationHeader';
import RegistrationPageShell from '@/components/RegistrationPageShell';
import UploadField from '@/components/UploadField';
import type { BusinessRegistrationFormData } from '@/lib/businessRegistration';
import { BUSINESS_TYPES } from '@/lib/businessDocumentation';
import { vendorApi, vendorAuth } from '@/lib/api';
import BusinessLocationFields from '@/components/BusinessLocationFields';
import { parseCoordinateInput } from '@/lib/locationGeocoding';

const TOTAL_STEPS = 4;

function validateStep(
  step: number,
  values: {
    businessName: string;
    businessOwner: string;
    businessType: string;
    phone: string;
    contactPerson: string;
    email: string;
    address: string;
    landmark: string;
    latitude: string;
    longitude: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  },
): string | null {
  const required = (value: string, label: string) =>
    value.trim() ? null : `${label} is required.`;

  switch (step) {
    case 1:
      return (
        required(values.businessName, 'Business name') ??
        required(values.businessOwner, 'Business owner') ??
        required(values.businessType, 'Business type')
      );
    case 2:
      return (
        required(values.phone, 'Phone') ??
        required(values.contactPerson, 'Contact person') ??
        required(values.email, 'Email')
      );
    case 3: {
      const addressError =
        required(values.address, 'Address') ?? required(values.landmark, 'Landmark');
      if (addressError) return addressError;

      const hasLatitude = values.latitude.trim().length > 0;
      const hasLongitude = values.longitude.trim().length > 0;

      if (hasLatitude !== hasLongitude) {
        return 'Enter both latitude and longitude, or leave both empty.';
      }

      if (hasLatitude && parseCoordinateInput(values.latitude) == null) {
        return 'Latitude must be a valid number.';
      }

      if (hasLongitude && parseCoordinateInput(values.longitude) == null) {
        return 'Longitude must be a valid number.';
      }

      return null;
    }
    case 4:
      return (
        required(values.bankName, 'Bank name') ??
        required(values.accountNumber, 'Account number') ??
        required(values.accountName, 'Account holder name')
      );
    default:
      return null;
  }
}

export default function VerifyBusiness() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [businessOwner, setBusinessOwner] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAccountEmail = async () => {
      const { data } = await vendorAuth.getSession();
      const accountEmail = data.session?.user?.email?.trim();
      if (!cancelled && accountEmail) {
        setEmail((current) => current || accountEmail);
      }
    };

    void loadAccountEmail();

    return () => {
      cancelled = true;
    };
  }, []);

  const uploadImage = async (file: File, kind: 'logo' | 'cover') => {
    const setUploading = kind === 'logo' ? setLogoUploading : setCoverUploading;
    const setError = kind === 'logo' ? setLogoUploadError : setCoverUploadError;
    const setPreview = kind === 'logo' ? setLogoPreview : setCoverPreview;
    const setUrl = kind === 'logo' ? setLogoUrl : setCoverImageUrl;

    setUploading(true);
    setError(null);
    setPreview(URL.createObjectURL(file));

    const result = await vendorApi.uploadRestaurantImage(file, kind);
    setUploading(false);

    if (result.error || !result.data) {
      setError(result.error ?? 'Upload failed');
      return;
    }

    setUrl(result.data.url);
    setPreview(result.data.url);
  };

  const handleLogoSelect = (file: File | null) => {
    if (!file) return;
    void uploadImage(file, 'logo');
  };

  const handleCoverSelect = (file: File | null) => {
    if (!file) return;
    void uploadImage(file, 'cover');
  };

  const handleNext = () => {
    if (step === 1 && (logoUploading || coverUploading)) {
      setStepError('Please wait for image uploads to finish.');
      return;
    }

    const error = validateStep(step, {
      businessName,
      businessOwner,
      businessType,
      phone,
      contactPerson,
      email,
      address,
      landmark,
      latitude,
      longitude,
      bankName,
      accountNumber,
      accountName,
    });

    if (error) {
      setStepError(error);
      return;
    }

    setStepError(null);

    if (step < TOTAL_STEPS) {
      setStep((current) => current + 1);
      return;
    }

    const payload: BusinessRegistrationFormData = {
      businessName,
      businessOwner,
      businessType,
      logoUrl,
      coverImageUrl,
      phone,
      contactPerson,
      email,
      address,
      landmark,
      latitude: parseCoordinateInput(latitude),
      longitude: parseCoordinateInput(longitude),
      bankName,
      accountNumber,
      accountName,
    };

    navigate('/verify-business/processing', { state: payload });
  };

  return (
    <RegistrationPageShell>
        <RegistrationPageHeader
          title="Details"
          subtitle="Register to get your business onboard"
          activeStep={step}
          totalSteps={TOTAL_STEPS}
        />

        <section className="flex min-h-0 flex-1 flex-col">
          {step === 1 ? (
            <>
              <RegistrationSectionHeader
                title="Business information"
                description="Provide the basic information to get started with us."
              />

              <div className="space-y-6 [color-scheme:light]">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField label="Business name" required>
                    <FormTextInput
                      type="text"
                      value={businessName}
                      onChange={(event) => setBusinessName(event.target.value)}
                      placeholder="All You Can Eat"
                      required
                    />
                  </FormField>

                  <FormField label="Business Owner" required>
                    <FormTextInput
                      type="text"
                      value={businessOwner}
                      onChange={(event) => setBusinessOwner(event.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </FormField>
                </div>

                <FormField label="Business Type" required>
                  <FormSelect
                    value={businessType}
                    onChange={(event) => setBusinessType(event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                <div className="grid gap-6 md:grid-cols-2">
                  <UploadField
                    label="Logo"
                    previewUrl={logoPreview}
                    uploading={logoUploading}
                    error={logoUploadError}
                    onFileSelect={handleLogoSelect}
                  />
                  <UploadField
                    label="Cover Image"
                    previewUrl={coverPreview}
                    uploading={coverUploading}
                    error={coverUploadError}
                    onFileSelect={handleCoverSelect}
                  />
                </div>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <RegistrationSectionHeader
                title="Contact information"
                description="How customers and delivery partners can reach you."
              />

              <div className="space-y-6 [color-scheme:light]">
                <FormField label="Phone" required>
                  <FormTextInput
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="0000 000 0000"
                    required
                  />
                </FormField>

                <FormField label="Contact Person" required>
                  <FormTextInput
                    type="text"
                    value={contactPerson}
                    onChange={(event) => setContactPerson(event.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </FormField>

                <FormField label="Email" required>
                  <FormTextInput
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Allyoucaneat@gmail.com"
                    required
                  />
                </FormField>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <RegistrationSectionHeader
                title="Location"
                description="Where customers and riders can find you."
              />

              <BusinessLocationFields
                address={address}
                landmark={landmark}
                latitude={latitude}
                longitude={longitude}
                onAddressChange={setAddress}
                onLandmarkChange={setLandmark}
                onLatitudeChange={setLatitude}
                onLongitudeChange={setLongitude}
              />
            </>
          ) : null}

          {step === 4 ? (
            <>
              <RegistrationSectionHeader
                title="Finance"
                description="Where your earnings will be paid."
              />

              <div className="space-y-6 [color-scheme:light]">
                <FormField label="Bank Name" required>
                  <FormTextInput
                    type="text"
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    placeholder="Enter name here"
                    required
                  />
                </FormField>

                <FormField label="Account Number" required>
                  <FormTextInput
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    placeholder="xxx xxx xxxx"
                    required
                  />
                </FormField>

                <FormField label="Account Holder Name" required>
                  <FormTextInput
                    type="text"
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                    placeholder="Enter name here"
                    required
                  />
                </FormField>
              </div>
            </>
          ) : null}
        </section>

        {stepError ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {stepError}
          </p>
        ) : null}

        <RegistrationStepFooter onNext={handleNext} label="Next" />
    </RegistrationPageShell>
  );
}
