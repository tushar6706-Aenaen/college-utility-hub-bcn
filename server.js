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

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://col-uti-hub-fnd.vercel.app' 
    : 'http://localhost:5173',
  credentials: true,
}));



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
app.get('/', (req, res) => {
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
  // console.log(`📍 Allowed origins:`, allowedOrigins);
});