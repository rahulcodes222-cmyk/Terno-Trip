# Booking Service Dockerfile — Self-contained, builds on any context
# Connects to MongoDB if MONGODB_URI is set (shows real DB bookings, latest first).
# Falls back to in-memory store if no MongoDB (local testing).

FROM node:20-alpine

WORKDIR /app

RUN cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4004;
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(express.json());

console.log('🚀 Booking Service Starting...');
console.log('PORT:', PORT);
console.log('MONGODB_URI set:', !!MONGODB_URI);

// In-memory fallback store (used when MongoDB is not configured)
const memoryBookings = [];

// ── MongoDB connection (optional) ───────────────────────────────────────────
let Booking = null;

if (MONGODB_URI) {
  try {
    const mongoose = require('mongoose');
    const bookingSchema = new mongoose.Schema(
      {
        bookingRef: { type: String, required: true },
        tripId: String,
        departureDate: String,
        travellers: Array,
        travellersCount: Number,
        totalAmount: Number,
        status: { type: String, default: 'Pending' },
        paymentStatus: { type: String, default: 'Pending' },
        contactEmail: String,
        contactPhone: String,
        specialRequests: String,
        createdAt: { type: Date, default: Date.now },
        tripSnapshot: Object,
        paymentId: String,
      },
      { timestamps: true }
    );
    Booking = mongoose.model('Booking', bookingSchema);
    mongoose
      .connect(MONGODB_URI, { dbName: 'terno_bookings' })
      .then(() => console.log('✅ Booking DB connected'))
      .catch((err) => console.error('❌ Booking DB connection error:', err.message));
  } catch (err) {
    console.error('❌ Mongoose not available, falling back to in-memory:', err.message);
  }
}

// ── Health endpoint ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'booking', timestamp: new Date().toISOString() });
});

// ── Root endpoint ───────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: 'booking-service',
    version: '1.0.0',
    status: 'running',
    db: !!MONGODB_URI,
    endpoints: [
      '/health',
      '/api/v1/bookings',
      '/api/v1/bookings/my',
      '/api/v1/bookings/:ref',
      '/api/v1/admin/bookings',
      '/api/v1/internal/bookings/update-payment',
    ],
  });
});

// ── Helper: async handler wrapper ───────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ── POST /api/v1/bookings — create booking ──────────────────────────────────
app.post('/api/v1/bookings', asyncHandler(async (req, res) => {
  const { tripId, departureDate, travellers, contactEmail, contactPhone, specialRequests, totalAmount, coverImage, tripTitle, tripDestination } = req.body || {};
  const bookingRef = 'TERNO-' + Math.floor(100000 + Math.random() * 900000);
  const perPerson = 1000;
  const count = Array.isArray(travellers) ? travellers.length : 1;
  const total = totalAmount != null ? Number(totalAmount) : count * perPerson;

  const bookingData = {
    bookingRef,
    tripId,
    departureDate,
    travellers: Array.isArray(travellers) ? travellers : [],
    travellersCount: count,
    totalAmount: total,
    status: 'Pending',
    paymentStatus: 'Pending',
    contactEmail: contactEmail || '',
    contactPhone: contactPhone || '',
    specialRequests: specialRequests || '',
    tripSnapshot: {
      title: tripTitle || 'Trip',
      destination: tripDestination || 'India',
      coverImage: coverImage || 'https://picsum.photos/seed/trip/800/600',
      pricePerPerson: perPerson,
      duration: 1,
      slug: 'trip',
    },
  };

  let booking;
  if (Booking) {
    booking = await Booking.create(bookingData);
  } else {
    const doc = { _id: 'booking_' + Date.now(), ...bookingData, createdAt: new Date() };
    memoryBookings.push(doc);
    booking = doc;
  }

  res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
}));

// ── GET /api/v1/bookings/my — My Bookings (paginated) ───────────────────────
app.get('/api/v1/bookings/my', asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let bookings, total;
  if (Booking) {
    [bookings, total] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments(),
    ]);
  } else {
    const sorted = [...memoryBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    total = sorted.length;
    bookings = sorted.slice(skip, skip + limit);
  }

  res.json({
    success: true,
    message: 'Bookings fetched successfully',
    data: bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}));

// ── GET /api/v1/bookings/:ref — booking by reference ────────────────────────
app.get('/api/v1/bookings/:ref', asyncHandler(async (req, res) => {
  let booking;
  if (Booking) {
    booking = await Booking.findOne({ bookingRef: req.params.ref }).lean();
  } else {
    booking = memoryBookings.find((b) => b.bookingRef === req.params.ref);
  }
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, message: 'Booking fetched successfully', data: booking });
}));

// ── DELETE /api/v1/bookings/:id — cancel ────────────────────────────────────
app.delete('/api/v1/bookings/:id', asyncHandler(async (req, res) => {
  let booking;
  if (Booking) {
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    ).lean();
  } else {
    const idx = memoryBookings.findIndex((b) => b._id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    memoryBookings[idx].status = 'Cancelled';
    booking = memoryBookings[idx];
  }
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
}));

// ── GET /api/v1/admin/bookings — Admin: all bookings (latest first) ─────────
app.get('/api/v1/admin/bookings', asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let bookings, total;
  if (Booking) {
    [bookings, total] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments(),
    ]);
  } else {
    const sorted = [...memoryBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    total = sorted.length;
    bookings = sorted.slice(skip, skip + limit);
  }

  res.json({
    success: true,
    message: 'All bookings fetched',
    data: bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}));

// ── POST /api/v1/internal/bookings/update-payment — confirm booking ─────────
app.post('/api/v1/internal/bookings/update-payment', asyncHandler(async (req, res) => {
  const { bookingId, paymentStatus, paymentId } = req.body || {};

  let booking;
  if (Booking) {
    booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: paymentStatus || 'Pending',
        status: paymentStatus === 'Paid' ? 'Confirmed' : 'Pending',
        ...(paymentId ? { paymentId } : {}),
      },
      { new: true }
    ).lean();
  } else {
    const bookingByRef = memoryBookings.find((b) => b._id === bookingId || b.bookingRef === bookingId);
    if (!bookingByRef) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    bookingByRef.paymentStatus = paymentStatus || 'Pending';
    bookingByRef.status = paymentStatus === 'Paid' ? 'Confirmed' : 'Pending';
    if (paymentId) bookingByRef.paymentId = paymentId;
    booking = bookingByRef;
  }

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, message: 'Payment status updated', data: booking });
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Booking service running on port ${PORT}`);
});

process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, reason); });
EOF

RUN cat > package.json << 'EOF'
{
  "name": "booking-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0"
  }
}
EOF

RUN npm install express@4.18.2 mongoose@8.0.0

EXPOSE 4004
CMD ["node", "server.js"]
