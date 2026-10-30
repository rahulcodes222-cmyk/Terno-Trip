# Implementation Plan — TernoTrip Admin Dashboard

## Overview
Build a full admin dashboard for the TernoTrip Next.js 14 app (App Router, TypeScript, Tailwind CSS).
Admin access is gated by `user.role === 'admin'` from `AuthContext`. The API gateway injects
`x-user-role: admin` into backend requests when the session cookie belongs to an admin user —
the frontend just sends the cookie and the gateway handles header injection automatically.

---

- [ ] 1. Create `src/lib/admin-api.ts` — typed admin API client.
      Uses the existing `apiClient` (axios instance from `src/lib/api-client.ts`).
      Exports five async functions:
      - `adminCreateTrip(data: Partial<ITrip>): Promise<ITrip>`  → POST `/api/v1/admin/trips`
      - `adminUpdateTrip(id: string, data: Partial<ITrip>): Promise<ITrip>` → PUT `/api/v1/admin/trips/:id`
      - `adminDeleteTrip(id: string): Promise<void>` → DELETE `/api/v1/admin/trips/:id`
      - `adminGetAllBookings(params: { page: number; limit: number }): Promise<PaginatedResponse<IBooking>>` → GET `/api/v1/bookings/admin` (admin all-bookings endpoint)
      - `adminGetStats(): Promise<{ totalTrips: number; totalBookings: number; totalRevenue: number; activeTrips: number }>` → GET `/api/v1/admin/stats` (gracefully returns zeros on 404 so dashboard never hard-fails)
      All functions rely on cookies already being sent (`withCredentials: true` is set on `apiClient`).
      No custom headers needed — the API gateway injects `x-user-role: admin` from the session.
      Files: `src/lib/admin-api.ts`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

- [ ] 2. Create `src/app/admin/layout.tsx` — admin shell layout with sidebar and role guard.
      This is a **server-safe** client component (`'use client'`).
      Role guard: reads `user.role` from `useAuth()`. While loading, show `<LoadingSpinner fullPage />`.
      If not authenticated or `user.role !== 'admin'`, redirect to `/auth/login?returnUrl=/admin` using
      `useRouter().replace(...)` inside a `useEffect`.
      Sidebar (left, 240 px wide, `bg-[#1B2E6B]` navy, white text):
        - TernoTrip logo (same `<TernoLogo>` markup — inline it or import Navbar's logo separately)
        - Nav items: Dashboard (`/admin`), Trips (`/admin/trips`), Bookings (`/admin/bookings`)
        - Icons from `lucide-react`: `LayoutDashboard`, `MapPin`, `Briefcase`
        - Active link: orange left border + `bg-white/10` background
        - Bottom: user name + Logout button (calls `logout()` from `useAuth()`, redirects to `/`)
      Main area: white bg, `flex-1`, `overflow-y-auto`, renders `{children}`.
      On mobile: sidebar collapses to a hamburger topbar (toggle state `sidebarOpen`).
      Files: `src/app/admin/layout.tsx`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

- [ ] 3. Update `src/components/layout/Navbar.tsx` — add Admin Dashboard link in user dropdown.
      In the desktop dropdown (after "Profile" link, before the `<hr>`), add:
      ```tsx
      {user?.role === 'admin' && (
        <Link href="/admin" onClick={() => setDropdownOpen(false)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#1B2E6B] font-semibold hover:bg-blue-50">
          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
        </Link>
      )}
      ```
      Add the same link in the mobile menu (after "Profile", before Logout).
      Import `LayoutDashboard` from `lucide-react`.
      Files: `src/components/layout/Navbar.tsx`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

- [ ] 4. Create `src/app/admin/page.tsx` — dashboard home with stats cards + recent trips table + quick actions.
      Stats row (4 cards): Total Trips, Active Trips, Total Bookings, Total Revenue.
        - Fetch from `adminGetStats()` using `useQuery({ queryKey: ['admin', 'stats'] })`.
        - On error / loading: show skeleton placeholders (gray `animate-pulse` divs).
      Recent Trips table: reuse `useTrips({ limit: 5, page: 1 })` (already public, no admin client needed).
        - Columns: Title, Destination, Price, Seats, Status (Active/Inactive badge using `Badge`), Actions.
        - Actions: "Edit" button → `router.push('/admin/trips/${trip._id}/edit')`, "Delete" → opens confirm modal.
      Quick Actions row: two `<Link>` cards — "Add New Trip" → `/admin/trips/new`, "View All Bookings" → `/admin/bookings`.
      Layout: uses the admin layout shell (just export default, the layout wraps it).
      Files: `src/app/admin/page.tsx`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

- [ ] 5. Create `src/app/admin/trips/page.tsx` — trips management table.
      Fetches trips with `useTrips(filters)` where filters include `search`, `page` (10 per page).
      Search input (controlled, 300 ms debounce using `useEffect` + `setTimeout`) updates `filters.search`.
      Table columns: Cover image (48×48 `object-cover rounded`), Title, Destination, Category, Price, Duration, Seats, Active toggle, Edit, Delete.
      Active toggle: inline `<button>` that calls `adminUpdateTrip(trip._id, { isActive: !trip.isActive })`,
      then `queryClient.invalidateQueries({ queryKey: ['trips'] })`.
      Delete: click opens confirm `Modal` (from `src/components/ui/Modal.tsx`), confirm calls `adminDeleteTrip`,
      then `queryClient.invalidateQueries`.
      Pagination: reuses `<Pagination>` component.
      "Add Trip" button top-right: `<Link href="/admin/trips/new">`.
      Files: `src/app/admin/trips/page.tsx`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

- [ ] 6. Create a shared `src/components/admin/TripForm.tsx` — reusable trip form component.
      Used by both new-trip and edit-trip pages to avoid duplication.
      Props: `defaultValues?: Partial<ITrip>`, `onSubmit: (data: TripFormData) => Promise<void>`, `isSubmitting: boolean`, `submitLabel: string`.
      Zod schema `tripFormSchema` covering all required `ITrip` fields:
        - `title` (string min 3), `destination` (string), `country` (string, default "India"),
        - `description` (string min 20), `shortDescription` (string min 10),
        - `category` (enum: Adventure|Beach|Cultural|Wildlife|City|Mountain|Budget),
        - `duration` (number min 1), `nights` (number min 0), `maxGroupSize` (number min 1),
        - `pricePerPerson` (number min 1), `discountPrice` (optional number),
        - `availableSeats` (number min 0), `difficulty` (enum: Easy|Moderate|Challenging),
        - `coverImage` (string url), `inclusions` (string — newline-separated, split on save),
        - `exclusions` (string — newline-separated), `highlights` (string — newline-separated),
        - `cancellationPolicy` (string), `isActive` (boolean), `isFeatured` (boolean),
        - `startDates` (string — comma-separated ISO dates, split on save).
      `inclusions`, `exclusions`, `highlights`, `startDates` are stored as textarea strings in the form,
      split into arrays before sending to API (and joined back from arrays for `defaultValues`).
      Uses `useForm<TripFormData>({ resolver: zodResolver(tripFormSchema) })`.
      Uses existing `<Input>` and `<Button>` components. Textareas use plain `<textarea>` with the same
      Tailwind classes as `Input` (`rounded-lg border px-3 py-2 text-sm shadow-sm ...`).
      Layout: two-column grid for most fields, full-width for textareas.
      Files: `src/components/admin/TripForm.tsx`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

- [ ] 7. Create `src/app/admin/trips/new/page.tsx` — add new trip.
      Imports `TripForm`. On submit calls `adminCreateTrip(data)` then redirects to `/admin/trips`.
      Wraps in admin layout (automatically via `src/app/admin/layout.tsx`).
      Error handling: catch block sets a `serverError` string displayed as a red banner.
      Files: `src/app/admin/trips/new/page.tsx`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

- [ ] 8. Create `src/app/admin/trips/[id]/edit/page.tsx` — edit existing trip.
      Route param: `{ params: { id: string } }` (the trip `_id`, not slug).
      Fetches trip by ID using `useQuery` → `apiClient.get<ApiResponse<ITrip>>('/api/v1/trips/'+id)`
      (falls back to listing and finding by `_id` if the public API only supports slug lookup —
      check: public GET `/api/v1/trips/:slug` uses slug, so fetch all and find by _id on client,
      or use slug stored in `params.id` if the trips table links by slug instead).
      **Decision**: the trips table in step 5 links to `/admin/trips/${trip._id}/edit`. The public API
      only supports lookup by slug. So this page does: `useTrips({ limit: 200 })` to get all trips
      (fine for admin, trips list is small), then finds the trip where `t._id === params.id`.
      Shows `<LoadingSpinner>` while loading, `<EmptyState>` if not found.
      Pre-fills `TripForm` via `defaultValues`. On submit calls `adminUpdateTrip(id, data)` then
      redirects to `/admin/trips`.
      Files: `src/app/admin/trips/[id]/edit/page.tsx`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

- [ ] 9. Create `src/app/admin/bookings/page.tsx` — bookings overview.
      Fetches all bookings using `useQuery` → `adminGetAllBookings({ page, limit: 15 })`.
      Falls back gracefully if the admin bookings endpoint doesn't exist (shows user's own bookings
      via `useMyBookings` as a fallback with a note).
      Table columns: Booking Ref, Traveller email, Trip title, Departure Date, Travellers, Total Amount,
      Status (`<Badge>`), Payment Status (`<Badge>`), Created At.
      Status filter tabs: All | Pending | Confirmed | Cancelled (client-side filter on fetched page).
      Pagination: `<Pagination>` component.
      Files: `src/app/admin/bookings/page.tsx`
      Verify: `cd apps/web && npm run build` — no TypeScript errors.

---

## Edge Cases & Notes

- **Role header injection**: The API gateway automatically injects `x-user-role: admin` from the
  session cookie — frontend code does NOT need to manually set this header. The `adminAuth`
  middleware on the trip service reads `req.headers['x-user-role']`.
- **Stats endpoint**: If `GET /api/v1/admin/stats` doesn't exist yet, `adminGetStats()` returns
  `{ totalTrips: 0, totalBookings: 0, totalRevenue: 0, activeTrips: 0 }` rather than throwing,
  so the dashboard renders with zeros.
- **Admin bookings endpoint**: If `GET /api/v1/bookings/admin` doesn't exist, `adminGetAllBookings`
  falls back to `GET /api/v1/bookings/my`. The page notes this in a banner.
- **Array fields**: `inclusions`, `exclusions`, `highlights`, `startDates` on `ITrip` are string
  arrays. The form stores them as newline/comma-separated strings and splits before API call.
- **Soft delete**: `adminDeleteTrip` sends DELETE to `/api/v1/admin/trips/:id`. The trip-service
  does a soft delete (sets `isActive: false`). Confirm modal text should say "This will deactivate
  the trip" rather than "permanently delete."
- **Build command**: `cd apps/web && npm run build` (Next.js 14 `next build`).
- **No test framework** in the web app — verification is TypeScript compilation only.
