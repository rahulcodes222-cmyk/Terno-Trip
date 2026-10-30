export type UserRole = "user" | "admin";
export interface IUser {
    _id: string;
    name: string;
    email: string;
    /** Never returned to the client. Present only on the raw DB document. */
    password?: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type TripCategory = "Adventure" | "Beach" | "Cultural" | "Wildlife" | "City" | "Mountain" | "Budget";
export type TripDifficulty = "Easy" | "Moderate" | "Challenging";
export interface ITripItineraryDay {
    day: number;
    title: string;
    description: string;
    meals?: string[];
    accommodation?: string;
    activities?: string[];
}
export interface ITrip {
    _id: string;
    title: string;
    destination: string;
    country: string;
    description: string;
    category: TripCategory;
    /** Duration in days */
    duration: number;
    maxGroupSize: number;
    pricePerPerson: number;
    discountPrice?: number;
    images: string[];
    itinerary: ITripItineraryDay[];
    inclusions: string[];
    exclusions: string[];
    accommodationType: string;
    difficulty: TripDifficulty;
    startDates: Date[];
    availableSeats: number;
    ratingsAverage: number;
    ratingsQuantity: number;
    cancellationPolicy: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Refunded";
export type PaymentStatus = "Pending" | "Paid" | "Refunded" | "Failed";
export interface ITraveller {
    firstName: string;
    lastName: string;
    age: number;
    /** Passport or national ID number */
    idNumber?: string;
}
export interface IBooking {
    _id: string;
    /** Unique human-readable reference, e.g. TERNO-A1B2C3 */
    bookingRef: string;
    userId: string;
    /** Populated when returned to clients */
    tripId: string | ITrip;
    departureDate: Date;
    travellers: ITraveller[];
    totalAmount: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    contactEmail: string;
    contactPhone: string;
    specialRequests?: string;
    createdAt: Date;
    updatedAt?: Date;
}
export type PaymentProvider = "mock" | "razorpay" | "stripe";
export type PaymentOrderStatus = "created" | "attempted" | "paid" | "failed" | "refunded";
export interface IPayment {
    _id: string;
    bookingId: string;
    userId: string;
    /** Amount in smallest currency unit (e.g. paise for INR) */
    amount: number;
    currency: string;
    provider: PaymentProvider;
    /** Provider-specific order/intent ID */
    providerOrderId?: string;
    /** Provider-specific payment ID (set after payment) */
    providerPaymentId?: string;
    status: PaymentOrderStatus;
    /** Raw webhook or callback payload stored for audit */
    providerPayload?: Record<string, unknown>;
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type NotificationType = "booking" | "payment" | "system";
export interface INotification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    /** Optional deep-link for the frontend */
    link?: string;
    createdAt: Date;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    /** Request correlation ID for tracing */
    correlationId?: string;
}
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
//# sourceMappingURL=index.d.ts.map