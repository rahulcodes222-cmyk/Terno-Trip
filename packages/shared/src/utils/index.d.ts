import type { ApiResponse, PaginatedResponse } from "../types/index.js";
/**
 * Wraps data in a standard ApiResponse envelope.
 */
export declare function createApiResponse<T>(data: T, message?: string, correlationId?: string): ApiResponse<T>;
/**
 * Creates an error ApiResponse envelope.
 */
export declare function createErrorResponse(error: string, message?: string, correlationId?: string): ApiResponse<never>;
/**
 * Wraps a data array and pagination metadata in a PaginatedResponse envelope.
 */
export declare function createPaginatedResponse<T>(data: T[], page: number, limit: number, total: number, message?: string, correlationId?: string): PaginatedResponse<T>;
/**
 * Formats an amount as a localized currency string.
 * Defaults to INR.
 *
 * @example formatCurrency(12500)         // "₹12,500.00"
 * @example formatCurrency(200, 'USD')    // "$200.00"
 */
export declare function formatCurrency(amount: number, currency?: string): string;
/**
 * Generates a unique booking reference in the format TERNO-XXXXXX.
 * Uses crypto.getRandomValues where available, falls back to Math.random.
 */
export declare function generateBookingRef(): string;
/**
 * Delays execution for the given number of milliseconds.
 * Useful for simulating async operations in tests and mock providers.
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Returns a shallow copy of `obj` containing only the specified `keys`.
 *
 * @example pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Returns a shallow copy of `obj` with the specified `keys` omitted.
 *
 * @example omit({ a: 1, b: 2, c: 3 }, ['b']) // { a: 1, c: 3 }
 */
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
//# sourceMappingURL=index.d.ts.map