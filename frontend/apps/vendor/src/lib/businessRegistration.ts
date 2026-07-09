export interface BusinessRegistrationFormData {
  businessName: string;
  businessOwner: string;
  businessType: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  phone: string;
  contactPerson: string;
  email: string;
  address: string;
  landmark: string;
  latitude?: number | null;
  longitude?: number | null;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export function toBusinessRegistrationPayload(data: BusinessRegistrationFormData) {
  return {
    business_name: data.businessName,
    business_owner: data.businessOwner,
    business_type: data.businessType,
    logo_url: data.logoUrl ?? null,
    cover_image_url: data.coverImageUrl ?? null,
    phone: data.phone,
    contact_person: data.contactPerson,
    email: data.email,
    address: data.address,
    landmark: data.landmark,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    bank_name: data.bankName,
    account_number: data.accountNumber,
    account_holder_name: data.accountName,
  };
}
