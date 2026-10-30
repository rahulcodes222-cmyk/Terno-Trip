export interface BookingIntent {
  tripId: string;
  tripSlug: string;
  departureDate: string;
  travellersCount: number;
}

const KEY = 'terno_booking_intent';

export const saveBookingIntent = (intent: BookingIntent): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(KEY, JSON.stringify(intent));
  }
};

export const getBookingIntent = (): BookingIntent | null => {
  if (typeof window === 'undefined') return null;
  const v = sessionStorage.getItem(KEY);
  try {
    return v ? (JSON.parse(v) as BookingIntent) : null;
  } catch {
    return null;
  }
};

export const clearBookingIntent = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(KEY);
  }
};
