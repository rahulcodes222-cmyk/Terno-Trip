import { Trip } from "../models/Trip.js";

// Generates future dates starting from offset months from now
function futureDate(monthsFromNow: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

const seedTrips = [
  // 1 — Adventure
  {
    title: "Manali Adventure Expedition",
    destination: "Manali",
    country: "India",
    description:
      "Embark on a thrilling adventure through the snow-capped Himalayan peaks of Manali. Trek through pristine valleys, camp under the stars at Rohtang Pass, and experience the adrenaline rush of river rafting on the Beas River. This expedition combines stunning high-altitude scenery with pulse-pounding activities.",
    category: "Adventure",
    duration: 7,
    maxGroupSize: 16,
    pricePerPerson: 18500,
    coverImage: "https://picsum.photos/seed/manali/800/600",
    images: [
      "https://picsum.photos/seed/manali/800/600",
      "https://picsum.photos/seed/manali2/800/600",
      "https://picsum.photos/seed/rohtang/800/600",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Manali", description: "Arrive at Manali, check in to the hotel, welcome dinner, and briefing for the week ahead.", accommodation: "Hotel Snowflake, Manali" },
      { day: 2, title: "Solang Valley Day", description: "Full-day trip to Solang Valley. Try zorbing, paragliding, and snow activities. Evening bonfire.", accommodation: "Hotel Snowflake, Manali" },
      { day: 3, title: "Rohtang Pass Trek", description: "Early morning drive to Rohtang Pass (3978m). Short trek along the snowfields. Scenic photography stops.", accommodation: "Camp at Rohtang" },
      { day: 4, title: "Beas River Rafting", description: "Morning river rafting on the Beas River through Grade III rapids. Afternoon rest and local market visit.", accommodation: "Hotel Snowflake, Manali" },
      { day: 5, title: "Bijli Mahadev Trek", description: "Trek to Bijli Mahadev Temple offering panoramic valley views. Local cuisine lunch.", accommodation: "Hotel Snowflake, Manali" },
      { day: 6, title: "Old Manali & Hadimba Temple", description: "Explore Old Manali lanes, visit Hadimba Devi Temple, and shop for local handicrafts.", accommodation: "Hotel Snowflake, Manali" },
      { day: 7, title: "Departure", description: "Morning breakfast, last-minute shopping, and transfer to Manali bus stand/airport.", accommodation: "" },
    ],
    inclusions: [
      "6 nights accommodation",
      "Daily breakfast and dinner",
      "River rafting session",
      "Rohtang Pass permits and transport",
      "Certified adventure guide",
      "All transfers in AC vehicle",
    ],
    exclusions: [
      "Airfare or train fare",
      "Personal travel insurance",
      "Lunches",
      "Any activity not mentioned in itinerary",
      "Tips and gratuities",
    ],
    accommodationType: "Hotel + Camp",
    difficulty: "Moderate",
    startDates: [futureDate(1), futureDate(2), futureDate(3)],
    availableSeats: 16,
    ratingsAverage: 4.8,
    ratingsQuantity: 47,
    cancellationPolicy:
      "Free cancellation up to 14 days before departure. 50% refund between 7–14 days. No refund within 7 days.",
    isActive: true,
  },
  // 2 — Beach
  {
    title: "Goa Beaches Bliss",
    destination: "Goa",
    country: "India",
    description:
      "Soak in the sun, sand, and sea along Goa's most beautiful beaches. From the vibrant nightlife of Baga to the serene shores of Palolem, this tour covers the best of what Goa has to offer. Enjoy water sports, Portuguese architecture, and world-class seafood.",
    category: "Beach",
    duration: 5,
    maxGroupSize: 20,
    pricePerPerson: 14000,
    coverImage: "https://picsum.photos/seed/goa/800/600",
    images: [
      "https://picsum.photos/seed/goa/800/600",
      "https://picsum.photos/seed/goabeach/800/600",
      "https://picsum.photos/seed/palolem/800/600",
    ],
    itinerary: [
      { day: 1, title: "North Goa Arrival", description: "Arrive at Goa, check in. Evening walk at Calangute and Baga Beach. Seafood dinner at a beach shack.", accommodation: "Sea Breeze Resort, Calangute" },
      { day: 2, title: "Water Sports Day", description: "Morning water sports: parasailing, jet ski, banana boat. Afternoon at Anjuna flea market.", accommodation: "Sea Breeze Resort, Calangute" },
      { day: 3, title: "Old Goa & Spice Plantation", description: "Visit UNESCO Basilica of Bom Jesus, Spice Plantation tour with Goan lunch, evening at Vagator.", accommodation: "Sea Breeze Resort, Calangute" },
      { day: 4, title: "South Goa — Palolem Beach", description: "Day trip to Palolem. Kayaking in the calm backwaters. Sunset cruise from Agonda Beach.", accommodation: "Sea Breeze Resort, Calangute" },
      { day: 5, title: "Farewell", description: "Morning breakfast on the beach, last souvenir shopping at the market. Transfer to airport.", accommodation: "" },
    ],
    inclusions: [
      "4 nights beachside resort accommodation",
      "Daily breakfast",
      "Water sports package (North Goa)",
      "Spice plantation tour with lunch",
      "Sunset cruise",
      "All transfers",
    ],
    exclusions: [
      "Airfare",
      "Personal expenses",
      "Lunches and dinners (except spice plantation)",
      "Travel insurance",
    ],
    accommodationType: "Resort",
    difficulty: "Easy",
    startDates: [futureDate(1), futureDate(2), futureDate(4)],
    availableSeats: 20,
    ratingsAverage: 4.7,
    ratingsQuantity: 62,
    cancellationPolicy:
      "Free cancellation up to 10 days before departure. 50% refund between 5–10 days. No refund within 5 days.",
    isActive: true,
  },
  // 3 — Cultural
  {
    title: "Rajasthan Royal Heritage Tour",
    destination: "Jaipur, Udaipur & Jodhpur",
    country: "India",
    description:
      "Journey through the land of maharajas and discover the opulent palaces, ancient forts, and vibrant bazaars of Rajasthan. This cultural immersion takes you through the Pink City, the Blue City, and the City of Lakes — three jewels of India's royal heritage.",
    category: "Cultural",
    duration: 8,
    maxGroupSize: 18,
    pricePerPerson: 24500,
    coverImage: "https://picsum.photos/seed/rajasthan/800/600",
    images: [
      "https://picsum.photos/seed/rajasthan/800/600",
      "https://picsum.photos/seed/jaipur/800/600",
      "https://picsum.photos/seed/udaipur/800/600",
    ],
    itinerary: [
      { day: 1, title: "Jaipur Arrival", description: "Arrive in Jaipur. Check in to the heritage hotel. Evening at Chokhi Dhani for a traditional Rajasthani dinner.", accommodation: "Hotel Pearl Palace, Jaipur" },
      { day: 2, title: "Jaipur — Forts & Palaces", description: "Amber Fort, City Palace, Jantar Mantar observatory, and Hawa Mahal. Evening walk at Johari Bazaar.", accommodation: "Hotel Pearl Palace, Jaipur" },
      { day: 3, title: "Jaipur to Jodhpur", description: "Morning drive to Jodhpur. Check in. Visit Mehrangarh Fort and Jaswant Thada memorial.", accommodation: "Haveli Inn, Jodhpur" },
      { day: 4, title: "Jodhpur Blue City Walk", description: "Guided walk through the blue-painted lanes of old Jodhpur. Umaid Bhawan Palace museum visit.", accommodation: "Haveli Inn, Jodhpur" },
      { day: 5, title: "Jodhpur to Udaipur", description: "Scenic drive to Udaipur via Ranakpur Jain Temples. Arrive and check in to a lake-view hotel.", accommodation: "Lake Shore Hotel, Udaipur" },
      { day: 6, title: "Udaipur City Palace & Lake", description: "Visit City Palace museum, Jagdish Temple, and a boat ride on Lake Pichola past the Jag Mandir island.", accommodation: "Lake Shore Hotel, Udaipur" },
      { day: 7, title: "Udaipur — Villages & Crafts", description: "Day trip to Shilpgram crafts village and nearby Sajjangarh Monsoon Palace for panoramic views.", accommodation: "Lake Shore Hotel, Udaipur" },
      { day: 8, title: "Departure", description: "Morning breakfast. Transfer to Udaipur airport for onward journey.", accommodation: "" },
    ],
    inclusions: [
      "7 nights heritage hotel accommodation",
      "Daily breakfast and dinner",
      "All fort/monument entry tickets",
      "Boat ride on Lake Pichola",
      "AC vehicle for all transfers and sightseeing",
      "Certified cultural guide",
    ],
    exclusions: [
      "Airfare",
      "Personal shopping",
      "Camera fees at monuments",
      "Travel insurance",
      "Tips",
    ],
    accommodationType: "Heritage Hotel",
    difficulty: "Easy",
    startDates: [futureDate(1), futureDate(3), futureDate(5)],
    availableSeats: 18,
    ratingsAverage: 4.9,
    ratingsQuantity: 85,
    cancellationPolicy:
      "Free cancellation up to 15 days before departure. 40% refund between 8–15 days. No refund within 7 days.",
    isActive: true,
  },
  // 4 — Wildlife
  {
    title: "Kerala Backwaters & Wildlife Safari",
    destination: "Alleppey & Periyar",
    country: "India",
    description:
      "Experience the lush green heart of Kerala — cruise through serene backwaters on a traditional houseboat, trek through Periyar Tiger Reserve, and encounter elephants, deer, and exotic birds in their natural habitat. A perfect blend of nature and tranquillity.",
    category: "Wildlife",
    duration: 6,
    maxGroupSize: 14,
    pricePerPerson: 21000,
    coverImage: "https://picsum.photos/seed/kerala/800/600",
    images: [
      "https://picsum.photos/seed/kerala/800/600",
      "https://picsum.photos/seed/houseboat/800/600",
      "https://picsum.photos/seed/periyar/800/600",
    ],
    itinerary: [
      { day: 1, title: "Arrive in Kochi", description: "Arrive at Kochi. Transfer to Alleppey. Check in to houseboat. Evening cruise through backwaters.", accommodation: "Luxury Houseboat, Alleppey" },
      { day: 2, title: "Backwater Cruise", description: "Full-day houseboat cruise through narrow canals, rice paddies, and coconut groves. Traditional Kerala lunch on board.", accommodation: "Luxury Houseboat, Alleppey" },
      { day: 3, title: "Transfer to Periyar", description: "Morning drive to Thekkady/Periyar. Check in. Afternoon spice plantation walk.", accommodation: "Jungle Villa, Thekkady" },
      { day: 4, title: "Periyar Wildlife Safari", description: "Early morning jeep safari through Periyar Tiger Reserve. Spot elephants, bison, deer, and over 260 bird species.", accommodation: "Jungle Villa, Thekkady" },
      { day: 5, title: "Bamboo Rafting & Nature Walk", description: "Bamboo rafting on the Periyar Lake. Guided nature walk with a forest ranger. Traditional Kathakali performance in the evening.", accommodation: "Jungle Villa, Thekkady" },
      { day: 6, title: "Return to Kochi & Departure", description: "Scenic drive back to Kochi. Visit Mattancherry Spice Market. Transfer to airport.", accommodation: "" },
    ],
    inclusions: [
      "2 nights houseboat accommodation",
      "3 nights jungle resort",
      "All meals on houseboat",
      "Daily breakfast at resort",
      "Periyar jeep safari",
      "Bamboo rafting",
      "Kathakali performance tickets",
      "All transfers",
    ],
    exclusions: [
      "Airfare",
      "Forest entry fees (paid at gate)",
      "Personal expenses",
      "Travel insurance",
    ],
    accommodationType: "Houseboat + Jungle Resort",
    difficulty: "Easy",
    startDates: [futureDate(2), futureDate(3), futureDate(5)],
    availableSeats: 14,
    ratingsAverage: 4.8,
    ratingsQuantity: 53,
    cancellationPolicy:
      "Free cancellation up to 12 days before departure. 50% refund between 6–12 days. No refund within 5 days.",
    isActive: true,
  },
  // 5 — City
  {
    title: "Mumbai City Vibes",
    destination: "Mumbai",
    country: "India",
    description:
      "Discover the city of dreams — from the iconic Gateway of India to the buzzing lanes of Dharavi and the gleaming skyline of Bandra-Kurla. Mumbai is a city of contrasts that never sleeps, blending Bollywood glamour with colonial history and street-food culture.",
    category: "City",
    duration: 4,
    maxGroupSize: 20,
    pricePerPerson: 11500,
    coverImage: "https://picsum.photos/seed/mumbai/800/600",
    images: [
      "https://picsum.photos/seed/mumbai/800/600",
      "https://picsum.photos/seed/gateway/800/600",
      "https://picsum.photos/seed/marine/800/600",
    ],
    itinerary: [
      { day: 1, title: "South Mumbai Iconic Landmarks", description: "Arrive at Mumbai. Visit Gateway of India, Taj Mahal Palace Hotel exterior, Colaba Causeway, and Marine Drive.", accommodation: "Hotel Suba International, Mumbai" },
      { day: 2, title: "Heritage Walk & Dharavi", description: "Morning Heritage Walk through Fort area and CST Station. Afternoon Dharavi guided community tour.", accommodation: "Hotel Suba International, Mumbai" },
      { day: 3, title: "Bollywood & Bandra", description: "Morning Bollywood studio tour at Film City. Afternoon street art walk in Bandra. Evening at Bandstand Promenade.", accommodation: "Hotel Suba International, Mumbai" },
      { day: 4, title: "Juhu Beach & Departure", description: "Morning at Juhu Beach with street food breakfast. Elephanta Caves ferry (optional). Transfer to airport.", accommodation: "" },
    ],
    inclusions: [
      "3 nights 3-star hotel",
      "Daily breakfast",
      "Dharavi community tour",
      "Bollywood Film City tour",
      "Heritage walk guide",
      "All airport transfers",
    ],
    exclusions: [
      "Airfare",
      "Elephanta Caves entry (optional)",
      "Lunches and dinners",
      "Personal expenses",
    ],
    accommodationType: "City Hotel",
    difficulty: "Easy",
    startDates: [futureDate(1), futureDate(2), futureDate(3)],
    availableSeats: 20,
    ratingsAverage: 4.5,
    ratingsQuantity: 38,
    cancellationPolicy:
      "Free cancellation up to 7 days before departure. 30% refund between 3–7 days. No refund within 3 days.",
    isActive: true,
  },
  // 6 — Mountain
  {
    title: "Ladakh — Land of High Passes",
    destination: "Leh & Nubra Valley",
    country: "India",
    description:
      "One of the most spectacular high-altitude landscapes on Earth — Leh-Ladakh offers moonlike terrain, ancient Buddhist monasteries, and the surreal Pangong Tso lake. Cross the world's highest motorable passes and spend nights under a canopy of brilliant stars.",
    category: "Mountain",
    duration: 8,
    maxGroupSize: 12,
    pricePerPerson: 29500,
    coverImage: "https://picsum.photos/seed/ladakh/800/600",
    images: [
      "https://picsum.photos/seed/ladakh/800/600",
      "https://picsum.photos/seed/pangong/800/600",
      "https://picsum.photos/seed/nubra/800/600",
    ],
    itinerary: [
      { day: 1, title: "Arrive in Leh", description: "Arrive at Leh Airport (3500m). Full day rest for acclimatisation. Light walk around Leh market.", accommodation: "Hotel Himalayan Retreat, Leh" },
      { day: 2, title: "Leh Local Sightseeing", description: "Visit Leh Palace, Shanti Stupa, Leh Bazaar, and Spituk Monastery. Short acclimatisation hike.", accommodation: "Hotel Himalayan Retreat, Leh" },
      { day: 3, title: "Monasteries Route", description: "Day trip to Hemis, Thiksey, and Shey Palace. Traditional Ladakhi lunch at local home.", accommodation: "Hotel Himalayan Retreat, Leh" },
      { day: 4, title: "Nubra Valley via Khardung La", description: "Cross Khardung La (5359m — world's highest motorable pass). Drive to Nubra Valley. Evening Bactrian camel safari at Hunder sand dunes.", accommodation: "Camp in Nubra Valley" },
      { day: 5, title: "Diskit & Back to Leh", description: "Visit Diskit Monastery with its giant Maitreya Buddha. Return to Leh via Khardung La.", accommodation: "Hotel Himalayan Retreat, Leh" },
      { day: 6, title: "Pangong Tso Lake", description: "Drive to the iconic Pangong Tso Lake (4350m). Camp overnight beside the lake for a magical sunrise.", accommodation: "Lakeside Camp, Pangong Tso" },
      { day: 7, title: "Return from Pangong", description: "Morning at the lake at sunrise. Drive back to Leh via Chang La Pass. Rest evening.", accommodation: "Hotel Himalayan Retreat, Leh" },
      { day: 8, title: "Departure", description: "Transfer to Leh Airport. Safe onward journey.", accommodation: "" },
    ],
    inclusions: [
      "7 nights accommodation (mix of hotel and camps)",
      "All meals",
      "Inner Line Permits for restricted areas",
      "Camel safari at Nubra",
      "Monastery entry fees",
      "Oxygen cylinder for emergencies",
      "Experienced Ladakhi guide",
      "All transfers in 4WD vehicle",
    ],
    exclusions: [
      "Airfare to/from Leh",
      "Personal travel insurance",
      "Tips",
      "Any activity not listed",
    ],
    accommodationType: "Hotel + Camp",
    difficulty: "Challenging",
    startDates: [futureDate(2), futureDate(3), futureDate(4)],
    availableSeats: 12,
    ratingsAverage: 4.9,
    ratingsQuantity: 71,
    cancellationPolicy:
      "Free cancellation up to 21 days before departure. 50% refund between 14–21 days. No refund within 14 days.",
    isActive: true,
  },
  // 7 — Budget
  {
    title: "Golden Triangle Budget Tour",
    destination: "Delhi, Agra & Jaipur",
    country: "India",
    description:
      "Experience India's most iconic destinations without breaking the bank. Visit the majestic Taj Mahal, the grand Amber Fort, and the historic Red Fort on this budget-friendly guided tour. Comfortable stays, efficient travel, and all major highlights included.",
    category: "Budget",
    duration: 5,
    maxGroupSize: 24,
    pricePerPerson: 8500,
    coverImage: "https://picsum.photos/seed/tajmahal/800/600",
    images: [
      "https://picsum.photos/seed/tajmahal/800/600",
      "https://picsum.photos/seed/redfort/800/600",
      "https://picsum.photos/seed/amberfort/800/600",
    ],
    itinerary: [
      { day: 1, title: "Arrive Delhi", description: "Arrive at Delhi. Check in to budget hotel. Evening walk at Connaught Place and India Gate.", accommodation: "Hotel Metro Inn, Delhi" },
      { day: 2, title: "Delhi Sightseeing", description: "Red Fort, Jama Masjid, Chandni Chowk street food walk, Humayun's Tomb, and Qutub Minar.", accommodation: "Hotel Metro Inn, Delhi" },
      { day: 3, title: "Agra — Taj Mahal", description: "Early train to Agra. Sunrise visit to the Taj Mahal, then Agra Fort. Return to Delhi by evening.", accommodation: "Hotel Metro Inn, Delhi" },
      { day: 4, title: "Delhi to Jaipur", description: "Morning drive to Jaipur. Hawa Mahal, City Palace exterior, and vibrant Johari Bazaar.", accommodation: "Hotel Clarks Inn, Jaipur" },
      { day: 5, title: "Amber Fort & Departure", description: "Amber Fort visit by morning. Transfer to Jaipur Railway Station or Airport.", accommodation: "" },
    ],
    inclusions: [
      "4 nights budget hotel accommodation",
      "Daily breakfast",
      "Delhi–Agra–Delhi train tickets (sleeper class)",
      "All monument entry fees",
      "AC coach for road transfers",
      "Licensed tour guide",
    ],
    exclusions: [
      "Airfare to Delhi",
      "Lunches and dinners",
      "Camera fees",
      "Personal expenses",
      "Travel insurance",
    ],
    accommodationType: "Budget Hotel",
    difficulty: "Easy",
    startDates: [futureDate(1), futureDate(2), futureDate(3)],
    availableSeats: 24,
    ratingsAverage: 4.4,
    ratingsQuantity: 112,
    cancellationPolicy:
      "Free cancellation up to 7 days before departure. 25% refund between 3–7 days. No refund within 3 days.",
    isActive: true,
  },
  // 8 — Adventure
  {
    title: "Andaman Island Adventure",
    destination: "Port Blair & Havelock Island",
    country: "India",
    description:
      "Dive into the crystal-clear waters of the Andaman Sea for an unforgettable island adventure. Discover pristine coral reefs, secluded beaches, and a rich colonial history on these emerald islands. Scuba diving, snorkelling, and sea kayaking await you.",
    category: "Adventure",
    duration: 6,
    maxGroupSize: 16,
    pricePerPerson: 22500,
    coverImage: "https://picsum.photos/seed/andaman/800/600",
    images: [
      "https://picsum.photos/seed/andaman/800/600",
      "https://picsum.photos/seed/havelock/800/600",
      "https://picsum.photos/seed/radhanagar/800/600",
    ],
    itinerary: [
      { day: 1, title: "Arrive Port Blair", description: "Arrive at Port Blair. Visit Cellular Jail and attend the Light & Sound Show.", accommodation: "TSG Blue Resort, Port Blair" },
      { day: 2, title: "Port Blair Sightseeing", description: "Corbyn's Cove Beach, Samudrika Naval Museum, North Bay Island snorkelling.", accommodation: "TSG Blue Resort, Port Blair" },
      { day: 3, title: "Ferry to Havelock Island", description: "Morning ferry to Havelock Island (Neil). Afternoon at Radhanagar Beach (Asia's Best Beach).", accommodation: "Symphony Palms Resort, Havelock" },
      { day: 4, title: "Scuba Diving Day", description: "Full-day scuba diving certification course (beginners welcome). Explore vibrant coral reefs and tropical fish.", accommodation: "Symphony Palms Resort, Havelock" },
      { day: 5, title: "Sea Kayaking & Snorkelling", description: "Morning sea kayaking through mangrove creeks. Afternoon snorkelling at Elephant Beach.", accommodation: "Symphony Palms Resort, Havelock" },
      { day: 6, title: "Return & Departure", description: "Return ferry to Port Blair. Last shopping at Aberdeen Bazaar. Transfer to airport.", accommodation: "" },
    ],
    inclusions: [
      "5 nights accommodation",
      "Daily breakfast and dinner",
      "Return ferry to Havelock",
      "Scuba diving (2 dives for beginners)",
      "Snorkelling at Elephant Beach",
      "Sea kayaking",
      "All transfers",
    ],
    exclusions: [
      "Airfare to Port Blair",
      "Cellular Jail entry",
      "Advanced diving certifications",
      "Lunches",
      "Travel insurance",
    ],
    accommodationType: "Beach Resort",
    difficulty: "Moderate",
    startDates: [futureDate(2), futureDate(4), futureDate(6)],
    availableSeats: 16,
    ratingsAverage: 4.8,
    ratingsQuantity: 59,
    cancellationPolicy:
      "Free cancellation up to 14 days before departure. 50% refund between 7–14 days. No refund within 7 days.",
    isActive: true,
  },
  // 9 — Cultural
  {
    title: "Varanasi Spiritual Journey",
    destination: "Varanasi",
    country: "India",
    description:
      "Step into the oldest living city in the world and experience the spiritual heart of India. Witness the mesmerizing Ganga Aarti at dawn, explore ancient ghats, and discover the timeless rituals of a city that has stood at the crossroads of life and death for 3,000 years.",
    category: "Cultural",
    duration: 4,
    maxGroupSize: 16,
    pricePerPerson: 12500,
    coverImage: "https://picsum.photos/seed/varanasi/800/600",
    images: [
      "https://picsum.photos/seed/varanasi/800/600",
      "https://picsum.photos/seed/gangaarti/800/600",
      "https://picsum.photos/seed/ghats/800/600",
    ],
    itinerary: [
      { day: 1, title: "Arrive & Evening Ganga Aarti", description: "Arrive in Varanasi. Check in. Evening boat ride to witness the grand Dashashwamedh Ghat Ganga Aarti ceremony.", accommodation: "Hotel Ganges View, Varanasi" },
      { day: 2, title: "Dawn Boat Ride & Ghats Walk", description: "Pre-dawn boat ride along the ghats to witness the sunrise rituals. Guided walk through 84 ghats. Visit Kashi Vishwanath Temple.", accommodation: "Hotel Ganges View, Varanasi" },
      { day: 3, title: "Sarnath Day Trip", description: "Day trip to Sarnath — where Buddha delivered his first sermon. Visit Dhamekh Stupa and archaeological museum.", accommodation: "Hotel Ganges View, Varanasi" },
      { day: 4, title: "Silk & Spices & Departure", description: "Morning visit to Banarasi silk weaving workshop. Spice market walk. Transfer to Varanasi Junction.", accommodation: "" },
    ],
    inclusions: [
      "3 nights riverside hotel",
      "Daily breakfast",
      "Boat rides (dawn and evening)",
      "Sarnath day trip with guide",
      "Silk weaving workshop visit",
      "Licensed spiritual guide",
      "All transfers",
    ],
    exclusions: [
      "Train/airfare to Varanasi",
      "Temple offerings",
      "Lunches and dinners",
      "Personal expenses",
    ],
    accommodationType: "Riverside Hotel",
    difficulty: "Easy",
    startDates: [futureDate(1), futureDate(3), futureDate(5)],
    availableSeats: 16,
    ratingsAverage: 4.7,
    ratingsQuantity: 43,
    cancellationPolicy:
      "Free cancellation up to 10 days before departure. 40% refund between 5–10 days. No refund within 5 days.",
    isActive: true,
  },
  // 10 — Beach
  {
    title: "Lakshadweep Island Escape",
    destination: "Agatti & Bangaram Island",
    country: "India",
    description:
      "Escape to India's most remote and pristine coral islands — Lakshadweep. With turquoise lagoons, white-sand beaches, and spectacular marine life, this is a paradise for snorkellers and honeymooners alike. Permits are limited, ensuring an unspoiled experience.",
    category: "Beach",
    duration: 5,
    maxGroupSize: 10,
    pricePerPerson: 35000,
    coverImage: "https://picsum.photos/seed/lakshadweep/800/600",
    images: [
      "https://picsum.photos/seed/lakshadweep/800/600",
      "https://picsum.photos/seed/agatti/800/600",
      "https://picsum.photos/seed/lagoon/800/600",
    ],
    itinerary: [
      { day: 1, title: "Arrive Agatti", description: "Fly to Agatti Island from Kochi. Transfer to resort. Afternoon lagoon walk and snorkelling.", accommodation: "Agatti Island Beach Resort" },
      { day: 2, title: "Bangaram Island", description: "Speedboat to uninhabited Bangaram Island. Full day with snorkelling, reef walk, and beach barbecue lunch.", accommodation: "Agatti Island Beach Resort" },
      { day: 3, title: "Scuba Diving & Kayaking", description: "Morning scuba diving on the coral reef. Afternoon glass-bottom boat tour and kayaking in the lagoon.", accommodation: "Agatti Island Beach Resort" },
      { day: 4, title: "Island Fishing & Sunset Cruise", description: "Traditional tuna fishing with local fishermen. Afternoon free beach time. Sunset dhow cruise.", accommodation: "Agatti Island Beach Resort" },
      { day: 5, title: "Departure", description: "Morning snorkelling. Transfer to Agatti airstrip for return flight to Kochi.", accommodation: "" },
    ],
    inclusions: [
      "4 nights resort accommodation",
      "All meals (full board)",
      "Entry permits (Lakshadweep permit required)",
      "Snorkelling gear and guide",
      "Scuba diving (2 introductory dives)",
      "All boat transfers between islands",
      "Glass-bottom boat tour",
    ],
    exclusions: [
      "Flights Kochi–Agatti–Kochi",
      "Advanced scuba certifications",
      "Alcohol",
      "Personal expenses",
      "Travel insurance",
    ],
    accommodationType: "Island Resort",
    difficulty: "Easy",
    startDates: [futureDate(3), futureDate(5), futureDate(7)],
    availableSeats: 10,
    ratingsAverage: 4.9,
    ratingsQuantity: 28,
    cancellationPolicy:
      "Free cancellation up to 21 days before departure. 60% refund between 14–21 days. No refund within 14 days (permit non-refundable).",
    isActive: true,
  },
  // 11 — Mountain
  {
    title: "Spiti Valley — Hidden Himalayan Kingdom",
    destination: "Spiti Valley",
    country: "India",
    description:
      "Off the beaten path and above the clouds, Spiti Valley is one of India's most breathtaking yet least-visited destinations. Journey through high-altitude desert landscapes, visit 1,000-year-old monasteries, and stay in traditional homestays in remote villages.",
    category: "Mountain",
    duration: 9,
    maxGroupSize: 10,
    pricePerPerson: 26500,
    coverImage: "https://picsum.photos/seed/spiti/800/600",
    images: [
      "https://picsum.photos/seed/spiti/800/600",
      "https://picsum.photos/seed/kibber/800/600",
      "https://picsum.photos/seed/keylong/800/600",
    ],
    itinerary: [
      { day: 1, title: "Shimla", description: "Arrive at Shimla. Check in. Evening on The Mall.", accommodation: "Hotel Willow Banks, Shimla" },
      { day: 2, title: "Shimla to Narkanda", description: "Drive to Narkanda (2700m). Apple orchards and Hatu Peak views.", accommodation: "Hatu Inn, Narkanda" },
      { day: 3, title: "Narkanda to Nako", description: "Drive through Rampur, Pooh, Khab confluence, to Nako village (3662m).", accommodation: "Homestay, Nako" },
      { day: 4, title: "Nako to Kaza", description: "Explore Nako Lake in the morning. Drive to Kaza (3800m) via Tabo Monastery (1000 years old).", accommodation: "Zostel Kaza" },
      { day: 5, title: "Kaza Local Exploration", description: "Key Monastery, Kibber village, fossil site, and local market at Kaza.", accommodation: "Zostel Kaza" },
      { day: 6, title: "Chandratal Lake", description: "Day trip to Chandratal (Moon Lake) at 4300m. One of the most beautiful alpine lakes in India.", accommodation: "Camp near Chandratal" },
      { day: 7, title: "Gramphu to Manali", description: "Cross Kunzum La Pass (4590m). Drive to Manali via Rohtang Pass.", accommodation: "Hotel Apple Pie, Manali" },
      { day: 8, title: "Manali Rest Day", description: "Explore Manali, Old Manali cafes, and Hadimba Temple. Debrief evening.", accommodation: "Hotel Apple Pie, Manali" },
      { day: 9, title: "Departure from Manali", description: "Transfer to Manali Bus Stand. Farewell.", accommodation: "" },
    ],
    inclusions: [
      "8 nights accommodation (mix of hotels, homestays, camps)",
      "All meals",
      "4WD vehicle with experienced driver",
      "Monastery entry fees",
      "Chandratal camping gear",
      "Certified guide",
    ],
    exclusions: [
      "Airfare to Shimla or Manali",
      "Personal expenses",
      "Travel insurance",
      "Inner Line Permit (if required)",
    ],
    accommodationType: "Hotel + Homestay + Camp",
    difficulty: "Challenging",
    startDates: [futureDate(2), futureDate(4), futureDate(5)],
    availableSeats: 10,
    ratingsAverage: 4.9,
    ratingsQuantity: 34,
    cancellationPolicy:
      "Free cancellation up to 21 days before departure. 50% refund between 14–21 days. No refund within 14 days.",
    isActive: true,
  },
  // 12 — Wildlife
  {
    title: "Jim Corbett Tiger Trail",
    destination: "Jim Corbett National Park",
    country: "India",
    description:
      "India's oldest national park is home to the highest density of Bengal tigers in the world. Embark on thrilling jeep safaris through dense sal forests, elephant grass, and river valleys in search of the legendary big cat, leopards, elephants, and over 600 species of birds.",
    category: "Wildlife",
    duration: 4,
    maxGroupSize: 12,
    pricePerPerson: 16000,
    coverImage: "https://picsum.photos/seed/corbett/800/600",
    images: [
      "https://picsum.photos/seed/corbett/800/600",
      "https://picsum.photos/seed/tiger/800/600",
      "https://picsum.photos/seed/safari/800/600",
    ],
    itinerary: [
      { day: 1, title: "Arrive Ramnagar", description: "Arrive at Ramnagar. Transfer to jungle resort. Evening nature walk with naturalist.", accommodation: "Corbett Machaan Resort" },
      { day: 2, title: "Morning & Evening Safari", description: "Dawn jeep safari in Dhikala Zone (highly restricted, excellent sightings). Evening safari in Bijrani Zone.", accommodation: "Corbett Machaan Resort" },
      { day: 3, title: "Elephant Safari & Birdwatching", description: "Morning elephant back safari for stealth approach. Afternoon guided birdwatching — over 600 species recorded.", accommodation: "Corbett Machaan Resort" },
      { day: 4, title: "Corbett Museum & Departure", description: "Visit Jim Corbett Museum at Kaladhungi. Transfer to Ramnagar Station/Kathgodam.", accommodation: "" },
    ],
    inclusions: [
      "3 nights jungle resort",
      "All meals",
      "2 jeep safaris (Dhikala + Bijrani zones)",
      "Elephant safari",
      "Birdwatching with certified naturalist",
      "All forest entry permits and fees",
      "All transfers",
    ],
    exclusions: [
      "Train/bus fare to Ramnagar",
      "Personal expenses",
      "Tips for guides",
      "Travel insurance",
    ],
    accommodationType: "Jungle Resort",
    difficulty: "Easy",
    startDates: [futureDate(1), futureDate(2), futureDate(4)],
    availableSeats: 12,
    ratingsAverage: 4.7,
    ratingsQuantity: 67,
    cancellationPolicy:
      "Free cancellation up to 10 days before departure. 50% refund between 5–10 days. No refund within 5 days.",
    isActive: true,
  },
];

// Helper: generate slug from title (mirrors the pre-save hook)
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function runSeed(): Promise<void> {
  try {
    const count = await Trip.countDocuments();
    if (count > 0) {
      console.log(`ℹ️   Trip collection already has ${count} documents — skipping seed.`);
      return;
    }

    console.log("🌱  Seeding 12 sample trips...");
    // Use save() per document so pre-save hooks (slug generation) fire correctly
    const tripsWithSlugs = seedTrips.map((t) => ({ ...t, slug: toSlug(t.title) }));
    await Trip.insertMany(tripsWithSlugs, { ordered: false });
    console.log(`✅  Successfully seeded ${seedTrips.length} trips.`);
  } catch (error) {
    console.error("❌  Seed error:", error);
    // Do not crash the server if seeding fails
  }
}
