export interface IUser {
  id: string;
  _id: string;
  email: string;
  name: string;         // single field from backend: "Rahul Sharma"
  firstName: string;    // derived: first word of name
  lastName: string;     // derived: rest of name
  role: 'user' | 'admin' | 'master';
}

export interface ITripItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  accommodation?: string;
}

export interface ITrip {
  _id: string;
  title: string;
  slug: string;
  destination: string;
  country: string;
  coverImage: string;
  images: string[];
  description: string;
  shortDescription: string;
  category: 'Adventure' | 'Beach' | 'Cultural' | 'Wildlife' | 'City' | 'Mountain' | 'Budget';
  duration: number;
  nights: number;
  maxGroupSize: number;
  pricePerPerson: number;
  discountPrice?: number;
  itinerary: ITripItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  startDates: string[];
  availableSeats: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  cancellationPolicy: string;
  isActive: boolean;
  isFeatured: boolean;
  masterId?: string;     // assigned bus master (optional)
}

export interface ITraveller {
  firstName: string;
  lastName: string;
  age: number;
  passportNumber?: string;
}

export interface IBooking {
  _id: string;
  bookingRef: string;
  userId: string;
  tripSnapshot: {
    title: string;
    destination: string;
    coverImage: string;
    pricePerPerson: number;
    duration: number;
    slug: string;
  };
  departureDate: string;
  travellers: ITraveller[];
  travellersCount: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Refunded';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded' | 'Failed';
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system';
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IPayment {
  _id: string;
  paymentRef: string;
  bookingRef: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  status: 'Pending' | 'Success' | 'Failed' | 'Refunded';
  orderId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export interface TripsFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
