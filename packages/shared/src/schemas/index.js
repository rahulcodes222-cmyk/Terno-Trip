import { z } from "zod";
// ─── Auth Schemas ─────────────────────────────────────────────────────────────
export const registerSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be at most 100 characters")
        .trim(),
    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address")
        .toLowerCase()
        .trim(),
    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters"),
});
export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address")
        .toLowerCase()
        .trim(),
    password: z.string({ required_error: "Password is required" }).min(1),
});
// ─── User / Profile Schemas ───────────────────────────────────────────────────
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100)
        .trim()
        .optional(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number")
        .optional()
        .or(z.literal("")),
    avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});
// ─── Trip Search Schema ───────────────────────────────────────────────────────
export const tripCategorySchema = z.enum([
    "Adventure",
    "Beach",
    "Cultural",
    "Wildlife",
    "City",
    "Mountain",
    "Budget",
]);
export const tripDifficultySchema = z.enum(["Easy", "Moderate", "Challenging"]);
export const searchTripsSchema = z.object({
    query: z.string().trim().optional(),
    category: tripCategorySchema.optional(),
    minPrice: z.coerce
        .number()
        .nonnegative("Minimum price must be non-negative")
        .optional(),
    maxPrice: z.coerce
        .number()
        .nonnegative("Maximum price must be non-negative")
        .optional(),
    duration: z.coerce
        .number()
        .int()
        .positive("Duration must be a positive integer")
        .optional(),
    difficulty: tripDifficultySchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    sortBy: z.enum(["pricePerPerson", "duration", "ratingsAverage"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
// ─── Booking Schemas ──────────────────────────────────────────────────────────
export const travellerSchema = z.object({
    firstName: z
        .string({ required_error: "First name is required" })
        .min(1)
        .max(100)
        .trim(),
    lastName: z
        .string({ required_error: "Last name is required" })
        .min(1)
        .max(100)
        .trim(),
    age: z
        .number({ required_error: "Age is required" })
        .int()
        .min(1, "Age must be at least 1")
        .max(120, "Age must be at most 120"),
    idNumber: z.string().trim().optional(),
});
export const createBookingSchema = z.object({
    tripId: z
        .string({ required_error: "Trip ID is required" })
        .min(1, "Trip ID is required"),
    departureDate: z
        .string({ required_error: "Departure date is required" })
        .datetime({ message: "Invalid departure date" }),
    travellers: z
        .array(travellerSchema)
        .min(1, "At least one traveller is required")
        .max(20, "Maximum 20 travellers allowed"),
    contactEmail: z
        .string({ required_error: "Contact email is required" })
        .email("Invalid contact email"),
    contactPhone: z
        .string({ required_error: "Contact phone is required" })
        .transform((v) => v.replace(/[\s\-()]/g, ""))
        .pipe(z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid contact phone number")),
    specialRequests: z.string().max(1000).optional(),
});
// ─── Payment Schemas ──────────────────────────────────────────────────────────
export const paymentSchema = z.object({
    bookingId: z
        .string({ required_error: "Booking ID is required" })
        .min(1, "Booking ID is required"),
    /** Mock scenario selector — only used by the mock payment provider */
    scenario: z
        .enum(["success", "failure", "pending", "timeout"])
        .default("success"),
});
// ─── Response Envelope Schemas ────────────────────────────────────────────────
export const apiResponseSchema = (dataSchema) => z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    correlationId: z.string().optional(),
});
export const paginationSchema = z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
});
export const paginatedResponseSchema = (itemSchema) => z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(itemSchema).optional(),
    pagination: paginationSchema,
    error: z.string().optional(),
    correlationId: z.string().optional(),
});
//# sourceMappingURL=index.js.map