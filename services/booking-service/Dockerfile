# Ultra Simple Booking Service Dockerfile
# Guaranteed to work on Render

FROM node:20-alpine

WORKDIR /app

# Create the simplest possible Express server
RUN cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

// Log environment
console.log('🚀 Booking Service Starting...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Health endpoint - ALWAYS works
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'healthy', 
    service: 'booking',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'booking-service',
    version: '2.0.0',
    status: 'running',
    endpoints: ['/health', '/api/v1/bookings']
  });
});

// Booking endpoint - SIMPLIFIED VERSION
app.post('/api/v1/bookings', (req, res) => {
  console.log('📦 Booking request received:', JSON.stringify(req.body));
  
  // Generate a booking reference
  const bookingRef = 'TERNO-' + Math.floor(100000 + Math.random() * 900000);
  
  // Simple response - always succeeds for testing
  res.json({
    success: true,
    message: 'Booking created successfully',
    data: {
      bookingRef: bookingRef,
      status: 'Pending',
      totalAmount: 0, // Would calculate from trip service
      createdAt: new Date().toISOString()
    }
  });
  
  console.log('✅ Booking created:', bookingRef);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Booking service running on port ${PORT}`);
  console.log(`✅ Health endpoint: http://0.0.0.0:${PORT}/health`);
  console.log(`✅ Ready to accept requests!`);
});

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
EOF

# Create minimal package.json
RUN cat > package.json << 'EOF'
{
  "name": "booking-service",
  "version": "2.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Install ONLY express (no other dependencies)
RUN npm install express@4.18.2

EXPOSE 4004
CMD ["node", "server.js"]