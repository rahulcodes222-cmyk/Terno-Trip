import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
}, {
    name: string;
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    avatar: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export declare const tripCategorySchema: z.ZodEnum<["Adventure", "Beach", "Cultural", "Wildlife", "City", "Mountain", "Budget"]>;
export declare const tripDifficultySchema: z.ZodEnum<["Easy", "Moderate", "Challenging"]>;
export declare const searchTripsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["Adventure", "Beach", "Cultural", "Wildlife", "City", "Mountain", "Budget"]>>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    difficulty: z.ZodOptional<z.ZodEnum<["Easy", "Moderate", "Challenging"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodEnum<["pricePerPerson", "duration", "ratingsAverage"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    query?: string | undefined;
    category?: "Adventure" | "Beach" | "Cultural" | "Wildlife" | "City" | "Mountain" | "Budget" | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    duration?: number | undefined;
    difficulty?: "Easy" | "Moderate" | "Challenging" | undefined;
    sortBy?: "duration" | "pricePerPerson" | "ratingsAverage" | undefined;
}, {
    query?: string | undefined;
    category?: "Adventure" | "Beach" | "Cultural" | "Wildlife" | "City" | "Mountain" | "Budget" | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    duration?: number | undefined;
    difficulty?: "Easy" | "Moderate" | "Challenging" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "duration" | "pricePerPerson" | "ratingsAverage" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type SearchTripsInput = z.infer<typeof searchTripsSchema>;
export declare const travellerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    age: z.ZodNumber;
    idNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    age: number;
    idNumber?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    age: number;
    idNumber?: string | undefined;
}>;
export declare const createBookingSchema: z.ZodObject<{
    tripId: z.ZodString;
    departureDate: z.ZodString;
    travellers: z.ZodArray<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        age: z.ZodNumber;
        idNumber: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        age: number;
        idNumber?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        age: number;
        idNumber?: string | undefined;
    }>, "many">;
    contactEmail: z.ZodString;
    contactPhone: z.ZodString;
    specialRequests: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tripId: string;
    departureDate: string;
    travellers: {
        firstName: string;
        lastName: string;
        age: number;
        idNumber?: string | undefined;
    }[];
    contactEmail: string;
    contactPhone: string;
    specialRequests?: string | undefined;
}, {
    tripId: string;
    departureDate: string;
    travellers: {
        firstName: string;
        lastName: string;
        age: number;
        idNumber?: string | undefined;
    }[];
    contactEmail: string;
    contactPhone: string;
    specialRequests?: string | undefined;
}>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export declare const paymentSchema: z.ZodObject<{
    bookingId: z.ZodString;
    /** Mock scenario selector — only used by the mock payment provider */
    scenario: z.ZodDefault<z.ZodEnum<["success", "failure", "pending", "timeout"]>>;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    scenario: "success" | "failure" | "pending" | "timeout";
}, {
    bookingId: string;
    scenario?: "success" | "failure" | "pending" | "timeout" | undefined;
}>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export declare const apiResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    message: z.ZodString;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    message: z.ZodString;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
    hasNextPage: z.ZodBoolean;
    hasPrevPage: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}>;
export declare const paginatedResponseSchema: <T extends z.ZodTypeAny>(itemSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodArray<T, "many">>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNextPage: z.ZodBoolean;
        hasPrevPage: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }>;
    error: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data?: T["_output"][] | undefined;
    error?: string | undefined;
    correlationId?: string | undefined;
}, {
    message: string;
    success: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    data?: T["_input"][] | undefined;
    error?: string | undefined;
    correlationId?: string | undefined;
}>;
//# sourceMappingURL=index.d.ts.map