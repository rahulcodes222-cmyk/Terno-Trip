// ─── API Response Helpers ─────────────────────────────────────────────────────
/**
 * Wraps data in a standard ApiResponse envelope.
 */
export function createApiResponse(data, message = "Success", correlationId) {
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
export function createErrorResponse(error, message = "An error occurred", correlationId) {
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
export function createPaginatedResponse(data, page, limit, total, message = "Success", correlationId) {
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
export function formatCurrency(amount, currency = "INR") {
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
export function generateBookingRef() {
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
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// ─── Object Utilities ─────────────────────────────────────────────────────────
/**
 * Returns a shallow copy of `obj` containing only the specified `keys`.
 *
 * @example pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 */
export function pick(obj, keys) {
    const result = {};
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
export function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
//# sourceMappingURL=index.js.map