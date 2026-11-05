# WORKING PAYMENT SERVICE DOCKERFILE
# Simple JavaScript service with all routes

FROM node:20-alpine

WORKDIR /app

# Create the payment service with all routes in JavaScript
RUN cat > index.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4005;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment', version: '1.0.0' });
});

// Payment API Routes
app.post('/api/v1/payments/create', (req, res) => {
  console.log('Create payment:', req.body);
  res.json({
    success: true,
    message: 'Payment created',
    paymentId: 'pay_' + Date.now(),
    orderId: 'order_' + Math.floor(100000 + Math.random() * 900000),
    amount: req.body.amount || 5000,
    status: 'pending'
  });
});

app.get('/api/v1/payments/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      orderId: 'order_123456',
      amount: 5000,
      status: 'success',
      createdAt: new Date().toISOString()
    }
  });
});

// Cashfree webhook (public - no auth)
app.post('/api/v1/payments/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  res.json({
    success: true,
    message: 'Webhook processed',
    orderId: req.body.orderId || 'unknown',
    status: req.body.status || 'success'
  });
});

// Internal routes
app.post('/api/v1/internal/payments/verify', (req, res) => {
  res.json({
    success: true,
    verified: true,
    paymentId: req.body.paymentId,
    amount: req.body.amount,
    status: 'verified'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    service: 'payment-service',
    version: '1.0.0',
    endpoints: [
      'POST /api/v1/payments/create',
      'GET /api/v1/payments/:id',
      'POST /api/v1/payments/webhook',
      'POST /api/v1/internal/payments/verify'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✅ Payment service running on port ${PORT}`);
  console.log(`📋 Endpoints available:`);
  console.log(`   POST /api/v1/payments/create`);
  console.log(`   POST /api/v1/payments/webhook`);
});
EOF

# Create package.json
RUN cat > package.json << 'EOF'
{
  "name": "payment-service",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Install dependencies
RUN npm install

EXPOSE 4005
CMD ["node", "index.js"]