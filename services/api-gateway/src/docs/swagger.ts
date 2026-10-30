/**
 * OpenAPI 3.0 specification for the Terno Trip Planner API.
 * Served at GET /api-docs (Swagger UI) and GET /api-docs.json (raw spec).
 */

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Terno Trip Planner API",
    version: "1.0.0",
    description:
      "REST API for the Terno Travel Booking Platform. All requests go through the API Gateway on port 4000.",
    contact: { name: "Terno Dev Team" },
  },
  servers: [
    { url: "http://localhost:4000", description: "Local Development (API Gateway)" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description: "JWT access token stored as an HTTP-only cookie. Set automatically after login/register.",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: { description: "Response payload (varies by endpoint)" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
          hasNextPage: { type: "boolean" },
          hasPrevPage: { type: "boolean" },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "admin"] },
          isVerified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Trip: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          destination: { type: "string" },
          country: { type: "string" },
          coverImage: { type: "string" },
          description: { type: "string" },
          category: { type: "string", enum: ["Adventure","Beach","Cultural","Wildlife","City","Mountain","Budget"] },
          duration: { type: "integer", description: "Duration in days" },
          pricePerPerson: { type: "number" },
          discountPrice: { type: "number" },
          availableSeats: { type: "integer" },
          ratingsAverage: { type: "number" },
          ratingsQuantity: { type: "integer" },
          difficulty: { type: "string", enum: ["Easy","Moderate","Challenging"] },
          startDates: { type: "array", items: { type: "string", format: "date-time" } },
          isActive: { type: "boolean" },
        },
      },
      Booking: {
        type: "object",
        properties: {
          _id: { type: "string" },
          bookingRef: { type: "string", example: "TRN4A2F8B" },
          userId: { type: "string" },
          tripSnapshot: {
            type: "object",
            properties: {
              title: { type: "string" },
              destination: { type: "string" },
              coverImage: { type: "string" },
              pricePerPerson: { type: "number" },
            },
          },
          departureDate: { type: "string", format: "date-time" },
          travellersCount: { type: "integer" },
          totalAmount: { type: "number" },
          status: { type: "string", enum: ["Pending","Confirmed","Cancelled","Refunded"] },
          paymentStatus: { type: "string", enum: ["Pending","Paid","Refunded","Failed"] },
          contactEmail: { type: "string", format: "email" },
          contactPhone: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Notification: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          title: { type: "string" },
          message: { type: "string" },
          type: { type: "string", enum: ["booking","payment","system"] },
          read: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    // ── AUTH ──────────────────────────────────────────────────────────────────
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User registered successfully" },
          "409": { description: "Email already in use" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful. Sets access_token and refresh_token cookies." },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout — clears auth cookies",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Logged out" },
          "401": { description: "Not authenticated" },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token using refresh_token cookie",
        responses: {
          "200": { description: "Tokens refreshed" },
          "401": { description: "Invalid or missing refresh token" },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/User" } } },
          },
          "401": { description: "Not authenticated" },
        },
      },
    },
    "/api/v1/auth/change-password": {
      patch: {
        tags: ["Auth"],
        summary: "Change password for the authenticated user",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password changed. All sessions invalidated." },
          "400": { description: "Wrong current password or passwords match" },
          "401": { description: "Not authenticated" },
        },
      },
    },
    // ── TRIPS ─────────────────────────────────────────────────────────────────
    "/api/v1/trips": {
      get: {
        tags: ["Trips"],
        summary: "List trips with search, filter, sort, and pagination",
        parameters: [
          { name: "query", in: "query", schema: { type: "string" }, description: "Text search" },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "difficulty", in: "query", schema: { type: "string", enum: ["Easy","Moderate","Challenging"] } },
          { name: "sortBy", in: "query", schema: { type: "string" } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc","desc"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
        ],
        responses: {
          "200": { description: "Paginated trip list" },
        },
      },
    },
    "/api/v1/trips/featured": {
      get: {
        tags: ["Trips"],
        summary: "Get featured trips (max 6)",
        responses: { "200": { description: "Featured trips array" } },
      },
    },
    "/api/v1/trips/trending": {
      get: {
        tags: ["Trips"],
        summary: "Get trending trips (most reviewed, max 4)",
        responses: { "200": { description: "Trending trips array" } },
      },
    },
    "/api/v1/trips/categories": {
      get: {
        tags: ["Trips"],
        summary: "Get all available trip categories",
        responses: { "200": { description: "Array of category strings" } },
      },
    },
    "/api/v1/trips/{slug}": {
      get: {
        tags: ["Trips"],
        summary: "Get a trip by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Trip detail" },
          "404": { description: "Trip not found" },
        },
      },
    },
    // ── USERS ─────────────────────────────────────────────────────────────────
    "/api/v1/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile",
        security: [{ cookieAuth: [] }],
        responses: { "200": { description: "User profile" }, "404": { description: "Not found" } },
      },
      put: {
        tags: ["Users"],
        summary: "Update user profile",
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  nationality: { type: "string" },
                  avatar: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Profile updated" } },
      },
    },
    "/api/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile (alias for /profile)",
        security: [{ cookieAuth: [] }],
        responses: { "200": { description: "User profile" } },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user profile (alias for PUT /profile)",
        security: [{ cookieAuth: [] }],
        responses: { "200": { description: "Profile updated" } },
      },
    },
    // ── BOOKINGS ──────────────────────────────────────────────────────────────
    "/api/v1/bookings": {
      post: {
        tags: ["Bookings"],
        summary: "Create a new booking",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tripId", "departureDate", "travellers", "contactEmail", "contactPhone"],
                properties: {
                  tripId: { type: "string" },
                  departureDate: { type: "string", format: "date" },
                  travellers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        age: { type: "integer" },
                      },
                    },
                  },
                  contactEmail: { type: "string", format: "email" },
                  contactPhone: { type: "string" },
                  specialRequests: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Booking created with status Pending" },
          "400": { description: "Trip unavailable or validation error" },
          "401": { description: "Not authenticated" },
        },
      },
    },
    "/api/v1/bookings/my": {
      get: {
        tags: ["Bookings"],
        summary: "Get current user's bookings",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: { "200": { description: "Paginated bookings" } },
      },
    },
    "/api/v1/bookings/{ref}": {
      get: {
        tags: ["Bookings"],
        summary: "Get booking by reference (own booking only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "ref", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Booking detail" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/v1/bookings/{id}/cancel": {
      patch: {
        tags: ["Bookings"],
        summary: "Cancel a booking",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Booking cancelled" },
          "404": { description: "Not found" },
          "400": { description: "Cannot cancel in current status" },
        },
      },
    },
    // ── PAYMENTS ──────────────────────────────────────────────────────────────
    "/api/v1/payments/orders": {
      post: {
        tags: ["Payments"],
        summary: "Create a payment order for a booking",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["bookingRef", "amount"],
                properties: {
                  bookingRef: { type: "string" },
                  amount: { type: "number" },
                  currency: { type: "string", default: "INR" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Payment order created — returns paymentRef and orderId" },
        },
      },
    },
    "/api/v1/payments/orders/{paymentRef}/process": {
      post: {
        tags: ["Payments"],
        summary: "Process a mock payment order (development only)",
        description: "⚠️ Only available when NODE_ENV=development. Disabled in production.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "paymentRef", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  scenario: { type: "string", enum: ["success","failure","pending","timeout"], default: "success" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Payment processed" },
          "403": { description: "Mock provider disabled in production" },
        },
      },
    },
    "/api/v1/payments/orders/{paymentRef}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment status",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "paymentRef", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Payment status" } },
      },
    },
    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
    "/api/v1/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get current user's notifications",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { "200": { description: "Paginated notifications" } },
      },
    },
    "/api/v1/notifications/unread-count": {
      get: {
        tags: ["Notifications"],
        summary: "Get count of unread notifications",
        security: [{ cookieAuth: [] }],
        responses: { "200": { description: "{ count: number }" } },
      },
    },
    "/api/v1/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark a notification as read",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Notification marked read" } },
      },
    },
    "/api/v1/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        security: [{ cookieAuth: [] }],
        responses: { "200": { description: "All marked read" } },
      },
    },
    // ── ADMIN TRIPS ───────────────────────────────────────────────────────────
    "/api/v1/admin/trips": {
      post: {
        tags: ["Admin"],
        summary: "Create a new trip (admin only)",
        security: [{ cookieAuth: [] }],
        responses: {
          "201": { description: "Trip created" },
          "403": { description: "Admin access required" },
        },
      },
    },
    "/api/v1/admin/trips/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Update a trip (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Trip updated" }, "403": { description: "Admin access required" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "Soft-delete a trip — sets isActive=false (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Trip deactivated" }, "403": { description: "Admin access required" } },
      },
    },
    "/api/v1/admin/trips/{id}/availability": {
      patch: {
        tags: ["Admin"],
        summary: "Update available seats for a trip (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["availableSeats"],
                properties: { availableSeats: { type: "integer", minimum: 0 } },
              },
            },
          },
        },
        responses: { "200": { description: "Availability updated" } },
      },
    },
    // ── HEALTH ────────────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["Health"],
        summary: "API Gateway health check",
        responses: { "200": { description: "Gateway healthy, lists upstream service URLs" } },
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication and session management" },
    { name: "Trips", description: "Trip catalogue and discovery" },
    { name: "Users", description: "User profile and preferences" },
    { name: "Bookings", description: "Booking lifecycle" },
    { name: "Payments", description: "Payment orders and processing" },
    { name: "Notifications", description: "In-app notifications" },
    { name: "Admin", description: "Admin-only trip management (requires role: admin)" },
    { name: "Health", description: "Service health" },
  ],
};
