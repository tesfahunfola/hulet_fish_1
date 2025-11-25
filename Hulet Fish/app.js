const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const communityMetricsRouter = require('./routes/communityMetricsRoutes');
const emissionRouter = require('./routes/emissionRoutes');
const recommendRouter = require('./routes/recommend');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Enable CORS
// Configure CORS origins from FRONTEND_URL (comma-separated) or fall back to common localhost dev origins
// Note: Currently using origin: true to allow all origins
// const allowedOrigins = process.env.FRONTEND_URL
//   ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
//   : [
//       'http://localhost:8080',
//       'http://localhost:5173',
//       'http://localhost:3000',
//       'http://127.0.0.1:8080',
//       'https://hulet-fish-1-ofen.vercel.app'
//     ];

app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 100,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serving static files only if the public directory exists (safe for split-host deployments)
const publicDir = `${__dirname}/public`;
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Serve frontend static files if build exists (for production)
const frontendBuildDir = `${__dirname}/Etxplore-frontend/dist`;
if (fs.existsSync(frontendBuildDir)) {
  app.use(express.static(frontendBuildDir));
}

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/community-metrics', communityMetricsRouter);
app.use('/api/v1/emissions', emissionRouter);
app.use('/api/v1/recommend', recommendRouter);

// SPA fallback: serve index.html for all non-API routes (allows client-side routing)
// This handles direct access or reload on routes like /login, /signup, etc.
app.all('*', (req, res, next) => {
  // Skip API routes
  if (req.originalUrl.startsWith('/api')) {
    return next(
      new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
    );
  }

  // If frontend build exists, serve index.html for SPA routing
  const indexPath = path.join(
    __dirname,
    'Etxplore-frontend',
    'dist',
    'index.html'
  );
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // Otherwise, return 404
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
