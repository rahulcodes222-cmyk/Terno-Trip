# Ultra Simple Booking Service Dockerfile
# Self-contained — no external COPY so it builds on any context.
# Includes GET /api/v1/bookings/my (My Bookings) and returns real totalAmount.

FROM node:20-alpine

WORKDIR /app

RUN cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

console.log('🚀 Booking Service Starting...');
console.log('PORT:', PORT);

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'booking', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'booking-service',
    version: '1.0.0',
    status: 'running',
    endpoints: ['/health', '/api/v1/bookings', '/api/v1/bookings/my', '/api/v1/bookings/:ref']
  });
});

// In-memory bookings store (dummy)
const bookings = [];

// POST /api/v1/bookings — create booking (returns real totalAmount, not 0)
app.post('/api/v1/bookings', (req, res) => {
  const { tripId, departureDate, travellers, contactEmail, contactPhone, specialRequests, totalAmount } = req.body || {};
  const bookingRef = 'TERNO-' + Math.floor(100000 + Math.random() * 900000);
  const perPerson = 1000; // default dummy price per person
  const count = Array.isArray(travellers) ? travellers.length : 1;
  const total = totalAmount != null ? Number(totalAmount) : count * perPerson;

  const travellersArr = Array.isArray(travellers) ? travellers : [];
  const booking = {
    _id: 'booking_' + Date.now(),
    bookingRef,
    tripId,
    departureDate,
    travellers: travellersArr,
    travellersCount: travellersArr.length,
    totalAmount: total,
    status: 'Pending',
    paymentStatus: 'Pending',
    contactEmail: contactEmail || '',
    contactPhone: contactPhone || '',
    specialRequests: specialRequests || '',
    createdAt: new Date().toISOString(),
    tripSnapshot: {
      title: 'Trip',
      destination: 'India',
      coverImage: 'https://picsum.photos/seed/trip/800/600',
      pricePerPerson: perPerson,
      duration: 1,
      slug: 'trip'
    }
  };
  bookings.push(booking);
  console.log('✅ Booking created:', bookingRef, 'totalAmount:', total);
  res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
});

// GET /api/v1/bookings/my — My Bookings (paginated) — FIXES 404
app.get('/api/v1/bookings/my', (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const total = bookings.length;
  const data = bookings.slice(skip, skip + limit);
  res.json({
    success: true,
    message: 'Bookings fetched successfully',
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

// GET /api/v1/bookings/:ref — booking by reference
app.get('/api/v1/bookings/:ref', (req, res) => {
  const booking = bookings.find(b => b.bookingRef === req.params.ref);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, message: 'Booking fetched successfully', data: booking });
});

// DELETE /api/v1/bookings/:id — cancel
app.delete('/api/v1/bookings/:id', (req, res) => {
  const idx = bookings.findIndex(b => b._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
  const booking = bookings.splice(idx, 1)[0];
  booking.status = 'Cancelled';
  res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Booking service running on port ${PORT}`);
});

process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, 'reason:', reason); });
EOF

RUN cat > package.json << 'EOF'
{
  "name": "booking-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": { "express": "^4.18.2" }
}
EOF

RUN npm install express@4.18.2

EXPOSE 4004
CMD ["node", "server.js"]
