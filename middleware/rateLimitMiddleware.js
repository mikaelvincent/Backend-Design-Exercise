const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req, res) => {
    const maxRequests = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 100;
    return maxRequests;
  },
  skip: (req, res) => {
    // Skip rate limiting during tests unless 'x-enable-rate-limit' header is set
    if (process.env.NODE_ENV === 'test' && !req.headers['x-enable-rate-limit']) {
      return true; // Skip rate limiting
    }
    return false;
  },
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  headers: true,
});

module.exports = limiter;
