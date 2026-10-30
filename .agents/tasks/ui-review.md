# TernoTrip homepage UI redesign

A full frontend rebuild replacing the previous home page with a Navbar, HeroSlider, StatsBar, DestinationCard, TripCardUpcoming, ReviewCard, and BlogCard. All new components are static-content or thin API wrappers; no auth pages, bookings, profile, or checkout files were touched. The Unsplash images used throughout are already whitelisted in `next.config.js`, and `images.unsplash.com` is in `remotePatterns`, so `next/image` is safe for those URLs.

Watch for: (1) `TripCard.tsx` still uses `next/image` with `trip.coverImage` — confirmed safe for Unsplash/Cloudinary/S3 URLs but will throw at runtime for any other host not in `remotePatterns`, including backend-stored relative paths. (2) Completed-trips filter uses `.every()` across all `startDates`, which always falls back to `trendingTrips.slice(0,3)` when any date is in the future — the section may show non-completed trips with misleading "COMPLETED" badge. (3) Blog links all point to `#blog` (the section anchor), not real article routes — stub-only.

**Verdict**: NEEDS_CHANGES

---

## High-level view

The Navbar correctly uses `bg-[#0A0A0A]`, white nav links, and an orange CTA. The mobile menu replicates all desktop items, with auth-aware user info and notification badge. The `'use client'` directive is correctly placed; `useAuth` and `useUnreadCount` are consumed without issues.

The HeroSlider runs a `setInterval` that is properly cleaned up via the `useEffect` return. The headline and subtext update reactively off `current` state while slide backgrounds transition via CSS opacity — a clean split that avoids re-mounting DOM elements on each tick. No concern here.

StatsBar has exactly 5 items (happy travellers, destinations, rating, safety, EMI), matching the spec.

DestinationCard accepts an optional `badge` typed as a string-union, with a fallback-safe `badgeColors` record. Three of four cards in `page.tsx` pass a badge; the fourth (Kerala) is intentionally badge-free. The component is presentational-only with no interactivity — clicking a destination card goes nowhere. This is likely intentional for a first pass but may be unexpected to users.

The upcoming/completed filter logic in `page.tsx` has a correctness gap: upcoming uses `.some()` (correct — any future date qualifies), but completed uses `.every()` (overly strict — a trip with even one future departure date is excluded). Because real trips often have multiple departure dates spanning past and future, this filter will almost always fall through to the `trendingTrips.slice(0,3)` fallback, which shows non-completed trips wearing a "COMPLETED" badge.

`TripCard.tsx` (used on the `/trips` listing page) still uses `next/image`. This is safe for the currently whitelisted hosts but will error at runtime if `trip.coverImage` ever contains a URL from a non-whitelisted domain. `TripCardUpcoming.tsx` (used on the home page) correctly uses a plain `<img>` tag throughout.

Blog cards link to `#blog` as a placeholder. No real blog routes exist, so this is a stub — acceptable for now, but reviewers should ensure it's tracked as a follow-up.

---

<details>
<summary>Issues (3)</summary>

1. **Completed-trips filter uses `.every()` not `.some()`** — `trendingTrips.filter(t => t.startDates.every(d => new Date(d) <= now))` excludes any trip that has even one future departure date, causing the "Completed Trips" section to almost always fall back to `trendingTrips.slice(0,3)` and show trips with a misleading "COMPLETED" badge. Change `.every()` to `.some()` (or flip the logic: keep trips where the *first* `startDate` is in the past).
2. **`TripCard.tsx` uses `next/image` with unconstrained `trip.coverImage`** — confirmed safe for Unsplash/Cloudinary/S3, but will throw a runtime error for any image host not in `remotePatterns`. If the backend ever returns a URL from another host (e.g., a self-hosted server or picsum path variant), the `/trips` page will break. Either add a catch-all pattern or guard the `src` with a fallback.
3. **Blog hrefs are stub anchors** — all three `BlogCard` instances pass `href="#blog"` and the "Read all stories" link also points to `#blog`. This should be tracked as a known stub before the page ships to users who expect article links.

</details>

---

<details>
<summary>Details</summary>

### Completed-trips `.every()` vs `.some()` filter

In `page.tsx`, the upcoming filter reads:

```ts
featuredTrips.filter((t) => t.startDates.some((d) => new Date(d) > now))
```

That's correct — a trip is "upcoming" if any of its dates is in the future.

The completed filter reads:

```ts
trendingTrips.filter((t) => t.startDates.length > 0 && t.startDates.every((d) => new Date(d) <= now))
```

A trip passes this only when *every* departure date is in the past. Any trip that offers even a single future departure (which is common for recurring/multi-batch trips) is excluded. In practice the filter will almost always produce an empty array, and `displayCompleted` falls back to `trendingTrips.slice(0,3)` — showing featured trending trips with a gray "COMPLETED · MMM YYYY" pill. The fix is to filter on the *earliest* `startDates[0]` being in the past, which matches how the upcoming variant works:

```ts
trendingTrips.filter((t) => t.startDates.length > 0 && new Date(t.startDates[0]) <= now)
```

### `TripCard.tsx` image domain gap

`TripCard` uses `next/image` with `fill` and `src={trip.coverImage}`. `next.config.js` whitelists `images.unsplash.com`, `picsum.photos`, Cloudinary, and S3. That covers seeds and typical production uploads.

The risk is confirmed for future-proofing: if the trip-service is ever seeded with a URL outside those patterns (localhost presigned URL, a different CDN, or a typo in the pattern), Next.js throws an `Invalid src` error that crashes the `/trips` listing page entirely rather than showing a broken image. A defensive fallback `src` or a wider catch-all pattern would isolate the blast radius to a single card.

### Destination cards have no click target

`DestinationCard` renders a `<div>` with no wrapping `<Link>` or `onClick`. Users clicking a destination card get no navigation. The spec didn't explicitly require navigation from destination cards, but a typical user expectation is that clicking "Manali" takes them to `/trips?destination=Manali` or similar. This is a possible UX gap depending on the product intent.

### Section IDs and anchor nav

All five required section IDs are present: `id="destinations"` (Popular Destinations), `id="upcoming"` (Upcoming Trips), `id="completed"` (Completed Trips), `id="reviews"` (Reviews), `id="blog"` (Blog). The navbar `navLinks` array uses `/#destinations`, `/#upcoming`, `/#completed`, `/#reviews`, `/#blog` — confirmed aligned.

### Timer cleanup and slider safety

`HeroSlider` calls `setInterval` inside `useEffect([])` and returns `() => clearInterval(timer)`. The timer is scoped to the component instance and cleaned up on unmount — no leak path. Dot indicators and the slide counter are both rendered from the same `current` state, so they stay in sync without a separate effect.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `app/page.tsx` | Rewritten home page with all sections, API-driven upcoming/completed, static reviews/blog |
| `components/layout/Navbar.tsx` | New black navbar with auth-aware user dropdown, notification badge, mobile menu |
| `components/home/HeroSlider.tsx` | New 3-slide auto-advancing hero, no search bar |
| `components/home/StatsBar.tsx` | New 5-item stats strip |
| `components/home/DestinationCard.tsx` | New image card with optional badge |
| `components/home/TripCardUpcoming.tsx` | New horizontal trip card, upcoming/completed variants |
| `components/home/ReviewCard.tsx` | New star-rating review card |
| `components/home/BlogCard.tsx` | New blog preview card with placeholder hrefs |
| `components/trips/TripCard.tsx` | Updated to show discount price, seats-left badge, category icon |

Full diff: `git diff main -- apps/web/src`

</details>
