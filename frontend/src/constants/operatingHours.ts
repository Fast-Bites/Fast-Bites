export const operatingHours = {
  weekdays: 'Mon - Thurs: 8:00 AM - 10:00 PM',
  weekend: 'Fri - Sat: 8:00 AM - 11:00 PM',
  sunday: 'Sun: Closed',
} as const;

export const operatingHoursMessage = `${operatingHours.weekdays}\n${operatingHours.weekend}\n${operatingHours.sunday}`;
