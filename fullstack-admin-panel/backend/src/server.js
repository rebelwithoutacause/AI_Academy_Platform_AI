const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import configurations and utilities
const { testConnection } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { syncDatabase } = require('./models');

// Import middleware
const { dynamicRateLimit, checkMaintenanceMode, attachPublicSettings } = require('./middleware/settings');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const toolRoutes = require('./routes/tools');
const suggestionRoutes = require('./routes/suggestions');
const auditRoutes = require('./routes/audit');
const settingsRoutes = require('./routes/settings');
const twoFARoutes = require('./routes/2fa');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:3000', 'https://yourdomain.com']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error_code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(checkMaintenanceMode);
app.use(attachPublicSettings);
app.use(dynamicRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    publicSettings: res.locals.publicSettings || {}
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/2fa', twoFARoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Admin Panel API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      tools: '/api/tools',
      suggestions: '/api/suggestions',
      audit: '/api/audit',
      settings: '/api/settings',
      '2fa': '/api/2fa'
    },
    documentation: '/api/docs'
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    endpoint: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    });
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      field: err.errors[0]?.path || 'unknown'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.log('Force closing server');
    process.exit(1);
  }, 10000);
};

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Admin Panel API Server...');

    // Skip database connections for development/testing
    if (process.env.SKIP_DB !== 'true') {
      try {
        // Test database connection
        await testConnection();
        console.log('✅ Database connected successfully');
      } catch (dbError) {
        console.log('⚠️  Database connection failed, continuing without DB:', dbError.message);
      }

      try {
        // Connect to Redis
        await connectRedis();
        console.log('✅ Redis connected successfully');
      } catch (redisError) {
        console.log('⚠️  Redis connection failed, continuing without Redis:', redisError.message);
      }

      try {
        // Sync database (create tables)
        await syncDatabase();
        console.log('✅ Database synced successfully');
      } catch (syncError) {
        console.log('⚠️  Database sync failed, continuing without sync:', syncError.message);
      }
    } else {
      console.log('⚠️  Skipping database connections (SKIP_DB=true)');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;