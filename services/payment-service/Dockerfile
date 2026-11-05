# Ultra Simple Payment Service Dockerfile
# Self-contained — no external COPY so it builds on any context.
# Returns the amount passed by the frontend (not 0).

FROM node:20-alpine

WORKDIR /app

RUN cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4005;

app.use(express.json());

console.log('🚀 Payment Service (Mock) Starting...');
console.log('PORT:', PORT);

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'payment', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'payment-service',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'POST /api/v1/payments/orders',
      'POST /api/v1/payments/orders/:id/process',
      'GET /api/v1/payments/orders/:id',
      'POST /api/v1/payments/webhook'
    ]
  });
});

// POST /api/v1/payments/orders — create payment order (returns amount, not 0)
app.post('/api/v1/payments/orders', (req, res) => {
  console.log('📦 Create payment order:', JSON.stringify(req.body));
  const orderId = 'order_' + Math.floor(100000 + Math.random() * 900000);
  const paymentSessionId = 'session_' + Date.now();
  const amount = Number(req.body.amount) || 0;
  res.json({
    success: true,
    message: 'Payment order created',
    data: {
      orderId,
      paymentSessionId,
      paymentRef: 'pay_ref_' + Date.now(),
      amount,
      currency: req.body.currency || 'INR',
      status: 'created',
      createdAt: new Date().toISOString()
    }
  });
  console.log('✅ Order created:', orderId, 'amount:', amount);
});

// POST /api/v1/payments/orders/:id/process — process payment (always success for dummy)
app.post('/api/v1/payments/orders/:id/process', (req, res) => {
  console.log(`🔄 Process payment order: ${req.params.id}`);
  res.json({
    success: true,
    message: 'Payment processed',
    data: {
      orderId: req.params.id,
      status: 'Success',
      transactionId: 'txn_' + Date.now(),
      processedAt: new Date().toISOString()
    }
  });
});

// GET /api/v1/payments/orders/:id — get payment status
app.get('/api/v1/payments/orders/:id', (req, res) => {
  console.log(`📊 Get payment status: ${req.params.id}`);
  res.json({
    success: true,
    data: {
      orderId: req.params.id,
      amount: 5000,
      currency: 'INR',
      status: 'success',
      paymentMethod: 'card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// POST /api/v1/payments/webhook — Cashfree webhook (public)
app.post('/api/v1/payments/webhook', (req, res) => {
  console.log('🔔 Webhook received:', JSON.stringify(req.body));
  res.json({
    success: true,
    message: 'Webhook processed',
    data: {
      orderId: req.body.orderId || 'unknown',
      status: req.body.status || 'success',
      processedAt: new Date().toISOString()
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Payment service running on port ${PORT}`);
  console.log(`✅ Health endpoint: http://0.0.0.0:${PORT}/health`);
});

process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, 'reason:', reason); });
EOF

RUN cat > package.json << 'EOF'
{
  "name": "payment-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": { "express": "^4.18.2" }
}
EOF

RUN npm install express@4.18.2

EXPOSE 4005
CMD ["node", "server.js"]
