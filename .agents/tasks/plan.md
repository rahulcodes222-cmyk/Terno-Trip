# Implementation Plan — TernoTrip UI Redesign

## Context (read before coding)

### Project setup
- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 3 — config at `apps/web/tailwind.config.ts`
- **Icons**: lucide-react (already installed)
- **Dev server**: `cd apps/web && npm run dev` → http://localhost:3000
- **Build check**: `cd apps/web && npm run build`
- **No test suite** exists — verify with build + visual check in browser

### Current primary color (MUST change)
`tailwind.config.ts` currently maps `primary` → green `#10B981`.  
The new brand color is **orange `#FF6B35`**. Every `text-primary`, `bg-primary`, `border-primary`, etc. will automatically pick up the new value once the config is changed. All existing dashboard/auth pages already use `primary` tokens — they will update automatically too (acceptable, per task brief they must not be "touched" structurally but the color change is global and intended).

### Available hooks (do NOT create new ones)
- `useFeaturedTrips()` → `ITrip[]` from `/api/v1/trips/featured`
- `useTrendingTrips()` → `ITrip[]` from `/api/v1/trips/trending`
- `useTrips(filters?)` → `PaginatedResponse<ITrip>` from `/api/v1/trips`
  - To get **upcoming trips**: pass `{ sortBy: 'date' }` — filter client-side by `startDates` containing a future date
  - To get **completed trips**: same call, filter client-side where the latest `startDate` is in the past

### ITrip fields available for cards
```
_id, title, slug, destination, country, coverImage, images,
description, shortDescription, category, duration, nights,
maxGroupSize, pricePerPerson, discountPrice?, itinerary,
inclusions, exclusions, highlights, difficulty, startDates[],
availableSeats, ratingsAverage, ratingsQuantity, cancellationPolicy,
isActive, isFeatured
```
Key display fields: `title`, `destination`, `coverImage`, `duration`, `nights`, `pricePerPerson`, `discountPrice`, `availableSeats`, `startDates[0]` (next departure), `ratingsAverage`, `ratingsQuantity`, `category`.

### Helper functions (already in `src/lib/utils.ts`)
- `formatCurrency(amount)` → `₹18,999`
- `formatDate(date, 'short'|'long')` → readable date
- `getCategoryIcon(category)` → emoji
- `cn(...classes)` → tailwind-merge

### Files NOT to touch
- `src/contexts/AuthContext.tsx`
- `src/hooks/` (all hooks)
- `src/components/ui/` (all files)
- `src/app/(auth)/` pages
- `src/app/bookings/`, `src/app/profile/`, `src/app/notifications/`, `src/app/checkout/`
- `src/components/auth/`, `src/components/bookings/`, `src/components/checkout/`

---

## Implementation Steps

---

- [ ] 1. **Update Tailwind config — change primary color to orange**

  Change the `primary` color palette in `tailwind.config.ts` from green `#10B981` to orange `#FF6B35`. Update all 50–900 shades to be consistent orange tints/shades.

  **Files**: `apps/web/tailwind.config.ts`

  **Exact change** — replace the entire `primary` block with:
  ```ts
  primary: {
    DEFAULT: '#FF6B35',
    50:  '#FFF3EE',
    100: '#FFE4D6',
    200: '#FFC8AD',
    300: '#FFAC84',
    400: '#FF8F5B',
    500: '#FF6B35',
    600: '#E8541A',
    700: '#C43F0E',
    800: '#9A2F08',
    900: '#712103',
  },
  ```
  Also add black/dark tokens for the navbar:
  ```ts
  dark: {
    DEFAULT: '#0A0A0A',
    800: '#1A1A1A',
  },
  ```

  **Verify**: `cd apps/web && npm run build` — must complete without errors.

---

- [ ] 2. **Update globals.css — fix scrollbar tokens + add animation keyframes**

  The scrollbar currently references `bg-primary-300` and `bg-primary-500` which will work with new orange. Add:
  1. `html { scroll-behavior: smooth; }` (move from `* {}` to `html {}` — more correct)
  2. A `@keyframes fadeIn` and `@keyframes slideUp` that the hero slider will use
  3. Keep all existing `line-clamp-*` utilities

  **Files**: `apps/web/src/app/globals.css`

  **Full replacement content**:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    html {
      scroll-behavior: smooth;
    }
    body {
      @apply font-sans text-gray-900 bg-white;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { @apply bg-gray-100; }
    ::-webkit-scrollbar-thumb { @apply bg-primary-300 rounded-full; }
    ::-webkit-scrollbar-thumb:hover { @apply bg-primary-500; }
  }

  @layer utilities {
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .animate-fade-in {
      animation: fadeIn 0.8s ease-in-out forwards;
    }
    .animate-slide-up {
      animation: slideUp 0.6s ease-out forwards;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  ```

  **Verify**: `npm run build` — no errors.

---

- [ ] 3. **Update layout.tsx — change page title to match demo**

  Update the `metadata` object title to `TernoTrip — India's Favourite Tour Packages` and description to match the travel/India theme. No structural changes.

  **Files**: `apps/web/src/app/layout.tsx`

  **Change**:
  ```ts
  export const metadata: Metadata = {
    title: {
      default: "TernoTrip — India's Favourite Tour Packages",
      template: '%s | TernoTrip',
    },
    description:
      "Discover India's best tour packages — Himalayas, Goa, Kerala, Rajasthan and more with TernoTrip.",
    keywords: ['travel', 'India', 'tour packages', 'trips', 'adventure', 'ternotrip'],
  };
  ```

  **Verify**: `npm run build` — no errors.

---

- [ ] 4. **Rewrite Navbar.tsx — black background, white links, orange CTA**

  Completely rewrite the navbar to match the demo's black header with white nav links and orange "Book Now" CTA button. Keep all existing auth logic (useAuth, useUnreadCount, dropdown, logout) — only the visual presentation changes.

  **Files**: `apps/web/src/components/layout/Navbar.tsx`

  **Visual spec**:
  - Header `bg-[#0A0A0A]` (black), full width, sticky, `z-50`
  - Logo: white "T" circle (bg-primary) + white text "TernoTrip"
  - Nav links in header: `Upcoming Trips` (href `/#upcoming`), `Destinations` (href `/#destinations`), `Completed` (href `/#completed`), `Reviews` (href `/#reviews`), `Blog` (href `/#blog`) — all white text, `hover:text-primary` (orange)
  - Right side when NOT authenticated: phone icon + "📞 Book Now" button with `bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-600`
  - Right side when authenticated: keep existing bell icon + user dropdown but with inverted colors for dark bg (white icons/text)
  - Mobile menu: same black background, links stacked vertically
  - Hamburger icon: white color on dark bg

  **Key structural change**: active link detection uses `pathname.startsWith` for hash-links (they all start with `/#` so active detection based on `pathname === '/'` for all of them).

  **Verify**: `npm run build` — no errors. Visually: dark header visible at localhost:3000.

---

- [ ] 5. **Create HeroSlider.tsx — full-screen fade slider with 3 slides**

  Create `src/components/home/HeroSlider.tsx` as a `'use client'` component. This is a pure CSS-transition fade slider using `useState` + `useEffect`, no external library.

  **Files**: `apps/web/src/components/home/HeroSlider.tsx` (CREATE)

  **Spec**:
  - 3 slides, each full-screen (`min-h-screen`) with a background image + dark overlay (`bg-black/50`)
  - Images: use picsum.photos seeds — slide 1: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920` (Himalayas), slide 2: `https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920` (Goa beach), slide 3: `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920` (Taj Mahal/Agra) — use `next/image` with `fill` and `priority` on slide 0
  - Top-left badge: `🇮🇳 India Domestic Tours Only` (white pill, small)
  - Centered text: headline changes per slide, fixed subtext, a "Explore Trips" CTA button (orange) linking to `/trips`
  - Bottom-right slide counter: `1 / 3` style
  - Bottom-center dot indicators (3 dots, active = filled orange)
  - Auto-advance every 5 seconds via `setInterval` in `useEffect`; clear interval on unmount
  - CSS transition: `opacity-0` ↔ `opacity-100` with `transition-opacity duration-1000`
  - Slides data array defined inline:
    ```ts
    const SLIDES = [
      { image: '...himalayas...', headline: 'Discover the Soul of India', sub: 'From snow-capped Himalayas to golden beaches of Goa — explore Incredible India.' },
      { image: '...goa...', headline: 'Sun, Sand & Serenity', sub: 'Feel the golden shores of Goa and drift into India's beach paradise.' },
      { image: '...taj...', headline: 'Land of Royals & Heritage', sub: 'Walk through majestic forts, royal palaces and the eternal symbol of love.' },
    ]
    ```

  **Verify**: `npm run build` — no errors.

---

- [ ] 6. **Create StatsBar.tsx — 5-stat horizontal bar**

  Create `src/components/home/StatsBar.tsx` as a server component (no `'use client'` needed — static content).

  **Files**: `apps/web/src/components/home/StatsBar.tsx` (CREATE)

  **Spec**:
  - Full-width section, `bg-[#0A0A0A]` (black), `py-6`
  - 5 stats in a flex row, centered, with dividers between them on desktop
  - Stats data (hardcoded):
    ```
    🏆  500+   Happy Travellers
    📍  25+    Indian Destinations
    ⭐  4.9/5  Average Rating
    🛡️  100%   Safe & Trusted
    💳  Easy EMI  Available
    ```
  - Each stat: emoji icon, bold white number/value, smaller gray-400 label below
  - Responsive: `grid grid-cols-2 md:grid-cols-5 gap-4` with centered text
  - On mobile shows 2-column grid, on md+ shows all 5 in a row

  **Verify**: `npm run build` — no errors.

---

- [ ] 7. **Create DestinationCard.tsx — destination card with badge**

  Create `src/components/home/DestinationCard.tsx`. This is a presentational card component used in the Popular Destinations section.

  **Files**: `apps/web/src/components/home/DestinationCard.tsx` (CREATE)

  **Props interface**:
  ```ts
  interface DestinationCardProps {
    image: string;
    name: string;
    subtitle: string;
    badge?: 'Popular' | 'Trending' | 'Top Rated';
  }
  ```

  **Spec**:
  - Card: `relative overflow-hidden rounded-2xl` with fixed aspect ratio (`aspect-[3/4]` or `h-64`)
  - Background image using `next/image` with `fill` + `object-cover`
  - Dark gradient overlay at bottom: `absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent h-2/3`
  - Badge (top-left, conditional): Popular = `bg-primary text-white`, Trending = `bg-blue-500 text-white`, Top Rated = `bg-green-500 text-white` — small pill `text-xs px-2.5 py-1 rounded-full`
  - Bottom text: `name` in bold white, `subtitle` in gray-300 small
  - Hover: `group-hover:scale-105` on image for subtle zoom

  **Verify**: `npm run build` — no errors.

---

- [ ] 8. **Create TripCardUpcoming.tsx — trip card for upcoming/completed sections**

  Create `src/components/home/TripCardUpcoming.tsx`. This matches the demo's horizontal-style trip card with a status banner (UPCOMING/COMPLETED), used in both the Upcoming and Completed sections.

  **Files**: `apps/web/src/components/home/TripCardUpcoming.tsx` (CREATE)

  **Props interface**:
  ```ts
  interface TripCardUpcomingProps {
    trip: ITrip;
    variant: 'upcoming' | 'completed';
  }
  ```

  **Spec** (matches demo layout — card with left image + right content):
  - Card container: `flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow`
  - Left: image block (`relative w-full sm:w-64 h-48 sm:h-auto shrink-0`)
    - `next/image` fill + object-cover
    - Top-left banner pill: `UPCOMING · {month year}` or `COMPLETED · {month year}` derived from `startDates[0]` using `formatDate()` — orange bg for upcoming, gray bg for completed
  - Right: content block `flex flex-col justify-between p-5`
    - Top: small uppercase `destination` (orange text, tracking-wide), then `title` (bold, large), then `shortDescription` (2 lines, gray-600)
    - Middle: `⏱ {duration} Days / {nights} Nights` + price `₹{pricePerPerson}/person` (upcoming) or just `₹{pricePerPerson}` (completed)
    - For upcoming: `👥 {availableSeats} seats left` in gray + orange "Book Now ↗" link to `/trips/{slug}`
    - For completed: `⭐ {ratingsAverage} · {ratingsQuantity} travellers` + gray "Read story ↗" link
  - Month/year for the banner: use `new Date(trip.startDates[0]).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase()` — falls back to 'TBA' if no startDates

  **Verify**: `npm run build` — no errors.

---

- [ ] 9. **Create ReviewCard.tsx — static testimonial card**

  Create `src/components/home/ReviewCard.tsx`. Pure presentational, no props needed from API — receives review data as props.

  **Files**: `apps/web/src/components/home/ReviewCard.tsx` (CREATE)

  **Props interface**:
  ```ts
  interface ReviewCardProps {
    stars: number;       // 1-5, shown as ★ characters
    text: string;        // review quote
    initials: string;    // e.g. "RK"
    name: string;        // "Rohit Kumar"
    meta: string;        // "Travelled to Ladakh"
  }
  ```

  **Spec**:
  - White card, rounded-2xl, border border-gray-100, shadow-sm, p-6
  - Stars: render `stars` count of `★` in orange (`text-primary`), rest in gray-300
  - Quote text: italic, gray-700, text-sm, mb-4
  - Bottom row: avatar circle (initials, bg-primary-100 text-primary-700) + name (font-medium) + meta (text-gray-500 text-xs)

  **Verify**: `npm run build` — no errors.

---

- [ ] 10. **Create BlogCard.tsx — static blog preview card**

  Create `src/components/home/BlogCard.tsx`. Static card with image, category tag, title, and read link.

  **Files**: `apps/web/src/components/home/BlogCard.tsx` (CREATE)

  **Props interface**:
  ```ts
  interface BlogCardProps {
    image: string;
    tag: string;        // e.g. "TRAVEL TIPS · 5 MIN READ"
    title: string;
    href: string;       // '#' for now since no blog page exists
  }
  ```

  **Spec**:
  - Card: white, rounded-2xl, border border-gray-100, overflow-hidden, hover:shadow-md transition
  - Top: image block `relative h-48 w-full` with `next/image` fill object-cover
  - Bottom: p-5 — small uppercase tag text (gray-500, text-xs tracking-wide), title (font-semibold text-gray-900 mt-1 line-clamp-2), "Read story ↗" link (text-primary text-sm font-medium mt-3 block)

  **Verify**: `npm run build` — no errors.

---

- [ ] 11. **Rewrite Footer.tsx — newsletter signup + black/dark footer**

  Rewrite `src/components/layout/Footer.tsx` to match the demo's footer with a newsletter signup section above the standard links + copyright.

  **Files**: `apps/web/src/components/layout/Footer.tsx`

  **Spec**:
  - Top newsletter band: `bg-primary` (orange), centered, `py-10` — headline "Get exclusive India travel deals", subtext "Subscribe for early-bird offers, trip stories, and travel tips.", email input + "Subscribe" button (white bg, orange text). Use `useState` for the email + submitted state (`'use client'` required). On submit: set submitted=true, show "You're on the list! Deals coming soon." confirmation.
  - Main footer body: `bg-[#0A0A0A]` (black), `py-12`, white text
    - Col 1 (brand): white "TernoTrip" logo + tagline in gray-400
    - Col 2 "Explore": links to /trips, /trips?category=Adventure, /trips?category=Beach, /trips?category=Cultural (white → hover:text-primary)
    - Col 3 "Company": About Us, Contact, Careers, Blog (static spans)
    - Col 4 "Support": Help Centre, Terms, Privacy, Cancellation (static spans)
  - Bottom bar: `border-t border-gray-800`, `© {year} TernoTrip. All rights reserved.` centered, text-gray-500 text-xs

  **Verify**: `npm run build` — no errors.

---

- [ ] 12. **Rewrite TripCard.tsx — update to match orange brand**

  The existing TripCard works well structurally. The only changes needed:
  1. The badge for seats left: currently hardcoded orange-500 — change to `bg-primary` to use the token
  2. Add a `isFeatured` badge check: if `trip.isFeatured` show a "Popular" badge in orange top-right (or top-left alongside category)
  3. The "View Trip →" button span: add `group-hover:bg-primary group-hover:text-white` already exists — no change needed
  4. The star icon: `fill-amber-400 text-amber-400` stays as-is (yellow stars, not orange)

  **Files**: `apps/web/src/components/trips/TripCard.tsx`

  **Exact change** — in the seats-left badge replace:
  ```tsx
  // OLD
  <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-medium text-white">
  // NEW
  <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white">
  ```
  And add after the category badge:
  ```tsx
  {trip.isFeatured && (
    <div className="absolute right-3 top-3">
      <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
        ⭐ Popular
      </span>
    </div>
  )}
  ```
  (The existing seats-left badge was in that same position — move seats-left to `left-3 bottom-3` to avoid overlap when isFeatured.)

  **Verify**: `npm run build` — no errors.

---

- [ ] 13. **Rewrite page.tsx — complete home page using new sections**

  Completely replace `src/app/page.tsx` with the new 10-section layout. This is the most substantial change.

  **Files**: `apps/web/src/app/page.tsx`

  **Imports needed**:
  ```ts
  'use client';
  import React from 'react';
  import Link from 'next/link';
  import { useTrips } from '@/hooks/useTrips';
  import PageLayout from '@/components/layout/PageLayout';
  import HeroSlider from '@/components/home/HeroSlider';
  import StatsBar from '@/components/home/StatsBar';
  import DestinationCard from '@/components/home/DestinationCard';
  import TripCardUpcoming from '@/components/home/TripCardUpcoming';
  import ReviewCard from '@/components/home/ReviewCard';
  import BlogCard from '@/components/home/BlogCard';
  ```

  **Data fetching** — use a single `useTrips()` call with no filters. Then split client-side:
  ```ts
  const { data: tripsData, isLoading } = useTrips({ limit: 20 });
  const allTrips = tripsData?.data ?? [];
  const now = new Date();

  const upcomingTrips = allTrips
    .filter(t => t.startDates.some(d => new Date(d) > now))
    .slice(0, 3);

  const completedTrips = allTrips
    .filter(t => t.startDates.length > 0 && t.startDates.every(d => new Date(d) <= now))
    .slice(0, 3);
  ```

  **Section-by-section structure**:

  ### Section 1: HeroSlider
  ```tsx
  <HeroSlider />
  ```
  Full width, no container — the component handles its own sizing.

  ### Section 2: StatsBar
  ```tsx
  <StatsBar />
  ```
  Full width black bar immediately below hero.

  ### Section 3: Popular Destinations (id="destinations")
  ```tsx
  <section id="destinations" className="py-16 bg-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            Top picks across India
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900">Popular Destinations</h2>
          <p className="text-gray-500 mt-1">From mountains to beaches — India has it all.</p>
        </div>
        <Link href="/trips" className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
          View all packages ↗
        </Link>
      </div>
      {/* 4-column grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DestinationCard image="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600" name="Manali" subtitle="Himachal Pradesh" badge="Popular" />
        <DestinationCard image="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600" name="Goa" subtitle="Beach Paradise" badge="Trending" />
        <DestinationCard image="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600" name="Agra" subtitle="Land of Royals" badge="Top Rated" />
        <DestinationCard image="https://images.unsplash.com/photo-1609766418204-94aae0ecbff4?w=600" name="Kerala" subtitle="God's Own Country" />
      </div>
    </div>
  </section>
  ```

  ### Section 4: Why Choose Us
  ```tsx
  <section className="py-16 bg-gray-50">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {WHY_ITEMS.map(item => (
          <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm">
            <span className="text-4xl mb-4">{item.icon}</span>
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  ```
  Where `WHY_ITEMS` is defined at module level:
  ```ts
  const WHY_ITEMS = [
    { icon: '🗺️', title: 'Curated Itineraries', desc: 'Every trip is hand-crafted by our local India travel experts for the best experience' },
    { icon: '🚌', title: 'All-Inclusive Packages', desc: 'Transport, stays, meals & sightseeing — everything covered in one price' },
    { icon: '👥', title: 'Small Group Tours', desc: 'Intimate groups of 8–16 travellers for a personal and memorable experience' },
    { icon: '📞', title: '24/7 Support', desc: 'Our dedicated team is always on call throughout your entire journey' },
  ];
  ```

  ### Section 5: Upcoming Trips (id="upcoming")
  ```tsx
  <section id="upcoming" className="py-16 bg-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Section header same pattern as Destinations */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            Book before seats fill up
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900">Upcoming Trips</h2>
          <p className="text-gray-500 mt-1">Fixed departure dates — reserve your spot today.</p>
        </div>
        <Link href="/trips" className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
          Get early access ↗
        </Link>
      </div>
      {/* Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : upcomingTrips.length > 0 ? (
        <div className="space-y-4">
          {upcomingTrips.map(trip => (
            <TripCardUpcoming key={trip._id} trip={trip} variant="upcoming" />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-10">No upcoming trips scheduled yet. Check back soon!</p>
      )}
    </div>
  </section>
  ```

  ### Section 6: Completed Trips (id="completed")
  Same structure as Upcoming but with `variant="completed"`, `id="completed"`, label "Real journeys, real memories", heading "Completed Trips", sub "A look back at the beautiful places we've explored together.", and link "Read trip stories ↗". Background: `bg-[#F9FAFB]`.

  ### Section 7: Reviews (id="reviews")
  ```tsx
  <section id="reviews" className="py-16 bg-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
          From our travellers
        </p>
        <h2 className="text-3xl font-extrabold text-gray-900">What people are saying</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReviewCard stars={5} text='"The Ladakh trip was a dream. TernoTrip handled everything — permits, stays, transport. I just had to show up and enjoy!"' initials="RK" name="Rohit Kumar" meta="Travelled to Ladakh" />
        <ReviewCard stars={5} text='"Kerala backwaters was beyond expectations. The houseboat stay and the sunset views — absolutely magical experience!"' initials="PS" name="Priya Sharma" meta="Travelled to Kerala" />
        <ReviewCard stars={5} text='"Rajasthan with TernoTrip was like stepping into a history book. The small group made it so personal and truly fun!"' initials="AM" name="Arjun Mehta" meta="Travelled to Rajasthan" />
      </div>
    </div>
  </section>
  ```

  ### Section 8: Blog (id="blog")
  ```tsx
  <section id="blog" className="py-16 bg-[#F9FAFB]">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            Travel tips & stories
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900">The Travel Journal</h2>
        </div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
          Read all stories ↗
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BlogCard image="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600" tag="TRAVEL TIPS · 5 MIN READ" title="Best time to visit Manali & Spiti Valley" href="#" />
        <BlogCard image="https://images.unsplash.com/photo-1609766418204-94aae0ecbff4?w=600" tag="DESTINATION GUIDE · 7 MIN READ" title="Kerala in 6 days: the perfect itinerary" href="#" />
        <BlogCard image="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600" tag="SLOW TRAVEL · 4 MIN READ" title="Why small-group tours are better in Rajasthan" href="#" />
      </div>
    </div>
  </section>
  ```

  **Verify**: `cd apps/web && npm run build` — must complete with 0 errors. Then `npm run dev` and open http://localhost:3000 — all 8 sections visible with black navbar, orange accents, hero slider cycling.

---

## Summary of all files changed / created

| # | Action | File |
|---|--------|------|
| 1 | MODIFY | `apps/web/tailwind.config.ts` |
| 2 | MODIFY | `apps/web/src/app/globals.css` |
| 3 | MODIFY | `apps/web/src/app/layout.tsx` |
| 4 | MODIFY | `apps/web/src/components/layout/Navbar.tsx` |
| 5 | CREATE | `apps/web/src/components/home/HeroSlider.tsx` |
| 6 | CREATE | `apps/web/src/components/home/StatsBar.tsx` |
| 7 | CREATE | `apps/web/src/components/home/DestinationCard.tsx` |
| 8 | CREATE | `apps/web/src/components/home/TripCardUpcoming.tsx` |
| 9 | CREATE | `apps/web/src/components/home/ReviewCard.tsx` |
| 10 | CREATE | `apps/web/src/components/home/BlogCard.tsx` |
| 11 | MODIFY | `apps/web/src/components/layout/Footer.tsx` |
| 12 | MODIFY | `apps/web/src/components/trips/TripCard.tsx` |
| 13 | MODIFY | `apps/web/src/app/page.tsx` |

## Order dependency
Steps 1-3 are independent and can be done in any order (config/layout).  
Steps 5-10 depend on step 1 (need orange primary token) but are independent of each other — create all new components freely.  
Step 4 (Navbar) and 11 (Footer) depend on step 1.  
Step 12 (TripCard) depends on step 1.  
Step 13 (page.tsx) depends on steps 5-10 all being created first — it imports them all.
