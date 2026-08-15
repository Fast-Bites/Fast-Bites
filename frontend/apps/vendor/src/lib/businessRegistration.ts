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
  /** 24h `HH:MM` — fallback / first window when hour_ranges omitted */
  openingTime?: string | null;
  closingTime?: string | null;
  /** Weekday indexes Mon=0 … Sun=6 that are open (legacy flat list) */
  workingDays?: number[] | null;
  /** Preferred: day ranges with their own open/close times */
  hourRanges?: Array<{
    startDay: number;
    endDay: number;
    openingTime: string;
    closingTime: string;
  }> | null;
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
    opening_time: data.openingTime ?? null,
    closing_time: data.closingTime ?? null,
    working_days: data.workingDays ?? null,
    hour_ranges: data.hourRanges?.map((range) => ({
      start_day: range.startDay,
      end_day: range.endDay,
      opening_time: range.openingTime,
      closing_time: range.closingTime,
    })) ?? null,
    bank_name: data.bankName,
    account_number: data.accountNumber,
    account_holder_name: data.accountName,
  };
}
