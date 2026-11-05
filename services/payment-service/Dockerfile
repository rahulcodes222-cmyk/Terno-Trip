# Payment Service Dockerfile - Complete mock with ALL endpoints
# For testing without real Cashfree integration

FROM node:20-alpine

WORKDIR /app

# Create complete mock payment service
RUN cat > index.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4005;

app.use(express.json());

console.log('🚀 Payment Service (Mock) Starting...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'payment-mock',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'payment-service-mock',
    version: '3.0.0',
    status: 'running',
    note: 'Mock service for testing - no real payments',
    endpoints: [
      'POST /api/v1/payments/orders',
      'POST /api/v1/payments/orders/:id/process',
      'GET /api/v1/payments/orders/:id',
      'POST /api/v1/payments/webhook'
    ]
  });
});

// 1. POST /api/v1/payments/orders - Create payment order
app.post('/api/v1/payments/orders', (req, res) => {
  console.log('📦 Create payment order:', JSON.stringify(req.body));
  
  // Return mock response that frontend expects
  res.json({
    success: true,
    message: 'Payment order created (mock)',
    data: {
      orderId: 'mock_order_' + Date.now(),
      paymentRef: 'pay_ref_' + Date.now(),
      paymentSessionId: 'mock_session_' + Date.now(), // Frontend expects this
      amount: req.body.amount || 0,
      currency: 'INR',
      status: 'created',
      createdAt: new Date().toISOString()
    }
  });
});

// 2. POST /api/v1/payments/orders/:id/process - Process/verify payment
app.post('/api/v1/payments/orders/:id/process', (req, res) => {
  console.log(`🔄 Process/verify payment: ${req.params.id}`, JSON.stringify(req.body));
  
  // Always return success for testing
  res.json({
    success: true,
    message: 'Payment processed successfully (mock)',
    data: {
      orderId: req.params.id,
      status: 'Success', // MUST be 'Success' (capital S) for frontend
      transactionId: 'mock_txn_' + Date.now(),
      processedAt: new Date().toISOString()
    }
  });
});

// 3. GET /api/v1/payments/orders/:id - Get payment status
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

// 4. POST /api/v1/payments/webhook - Cashfree webhook (public)
app.post('/api/v1/payments/webhook', (req, res) => {
  console.log('🔔 Webhook received (mock):', JSON.stringify(req.body));
  
  res.json({
    success: true,
    message: 'Webhook processed (mock)',
    data: {
      orderId: req.body.orderId || 'unknown',
      status: 'success',
      processedAt: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Payment mock service running on port ${PORT}`);
  console.log(`✅ Ready for testing!`);
});
EOF

# Minimal package.json
RUN cat > package.json << 'EOF'
{
  "name": "payment-service-mock",
  "version": "3.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Install ONLY express
RUN npm install express@4.18.2

EXPOSE 4005
CMD ["node", "index.js"]