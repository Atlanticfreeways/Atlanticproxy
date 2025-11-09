const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Atlantic Proxy API'
  });
});

// API routes
const { authenticateToken } = require('./middleware/auth');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', authenticateToken, require('./routes/users'));
app.use('/api/proxies', authenticateToken, require('./routes/proxies'));
app.use('/api/billing', authenticateToken, require('./routes/billing'));
app.use('/api/referrals', authenticateToken, require('./routes/referrals').router);
app.use('/api/analytics', authenticateToken, require('./routes/analytics'));
app.use('/api/support', authenticateToken, require('./routes/support'));
app.use('/api/admin', authenticateToken, require('./routes/admin'));
app.use('/api/reseller', authenticateToken, require('./routes/reseller'));
app.use('/api/enterprise', authenticateToken, require('./routes/enterprise'));
app.use('/api/whitelabel', authenticateToken, require('./routes/whitelabel'));

// Test routes (development only)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', require('./routes/test'));
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Atlantic Proxy API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});