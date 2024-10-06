const rateLimit = require('express-rate-limit');

// Define rate limiting rules
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  headers: true, // Send custom rate limit header with limit and remaining
});

module.exports = limiter;
