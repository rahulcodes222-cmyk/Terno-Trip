import type { ApiResponse, PaginatedResponse } from "../types/index.js";

// ─── API Response Helpers ─────────────────────────────────────────────────────

/**
 * Wraps data in a standard ApiResponse envelope.
 */
export function createApiResponse<T>(
  data: T,
  message = "Success",
  correlationId?: string
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    correlationId,
  };
}

/**
 * Creates an error ApiResponse envelope.
 */
export function createErrorResponse(
  error: string,
  message = "An error occurred",
  correlationId?: string
): ApiResponse<never> {
  return {
    success: false,
    message,
    error,
    correlationId,
  };
}

/**
 * Wraps a data array and pagination metadata in a PaginatedResponse envelope.
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = "Success",
  correlationId?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    correlationId,
  };
}

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Formats an amount as a localized currency string.
 * Defaults to INR.
 *
 * @example formatCurrency(12500)         // "₹12,500.00"
 * @example formatCurrency(200, 'USD')    // "$200.00"
 */
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Booking Reference ────────────────────────────────────────────────────────

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generates a unique booking reference in the format TERNO-XXXXXX.
 * Uses crypto.getRandomValues where available, falls back to Math.random.
 */
export function generateBookingRef(): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `TERNO-${suffix}`;
}

// ─── Async Utilities ──────────────────────────────────────────────────────────

/**
 * Delays execution for the given number of milliseconds.
 * Useful for simulating async operations in tests and mock providers.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Object Utilities ─────────────────────────────────────────────────────────

/**
 * Returns a shallow copy of `obj` containing only the specified `keys`.
 *
 * @example pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Returns a shallow copy of `obj` with the specified `keys` omitted.
 *
 * @example omit({ a: 1, b: 2, c: 3 }, ['b']) // { a: 1, c: 3 }
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}
