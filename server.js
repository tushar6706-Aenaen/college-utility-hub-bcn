const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// CORS Configuration
const exactOrigins = [
  'https://col-uti-hub-fnd.vercel.app',
  'https://col-uti-hub-fnd.vercel.app/', // tolerate trailing slash
  'https://college-utility-hub-bcn.vercel.app',
  'https://college-utility-hub-bcn.vercel.app/', // tolerate trailing slash
];

const localhostOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

const vercelRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app\/?$/i;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (exactOrigins.includes(origin)) return callback(null, true);
    if (localhostOrigins.includes(origin)) return callback(null, true);
    if (vercelRegex.test(origin)) return callback(null, true); // allow any vercel.app frontend
    console.log('❌ Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly with the same options
app.options('*', cors(corsOptions));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/events', require('./routes/events'));
app.use('/api/lostfound', require('./routes/lostfound'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/stats', require('./routes/stats'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 Allowed origins:`, allowedOrigins);
});