/**
 * Rate-limiting middleware for controlling the number of requests made by an IP address.
 * 
 * This middleware is applied globally to all incoming requests. It limits the number of requests
 * made from the same IP address within a defined window of time. If the rate limit is exceeded, 
 * further requests are blocked, and a '429 Too Many Requests' response is sent.
 * 
 * Environment Variables:
 * - `RATE_LIMIT_MAX`: Maximum number of requests allowed within the time window. Default is 100.
 * 
 * Configuration:
 * - Time window: 15 minutes (configurable by `windowMs`).
 * - Default maximum requests: 100 requests per IP address per window (can be overridden via environment variable).
 * - When in 'test' mode, rate limiting is disabled unless the header `x-enable-rate-limit` is explicitly set.
 * 
 * Errors:
 * - 429: Too many requests.
 * 
 * @param {Object} req    - The HTTP request object.
 * @param {Object} res    - The HTTP response object.
 * @param {Function} next - Function to pass control to the next middleware or route handler.
 */

const rateLimit = require('express-rate-limit');

// Configure the rate limiter with a 15-minute window and dynamic request limit
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: (req, res) => {
		// Use RATE_LIMIT_MAX environment variable if available, otherwise default to 100
		const maxRequests = process.env.RATE_LIMIT_MAX ?
			parseInt(process.env.RATE_LIMIT_MAX, 10) :
			100;
		return maxRequests;
	},
	skip: (req, res) => {
		// During tests, rate limiting is disabled unless 'x-enable-rate-limit' header is set
		if (process.env.NODE_ENV === 'test' && !req.headers['x-enable-rate-limit']) {
			return true; // Skip rate limiting
		}
		return false;
	},
	message: {
		message: 'Too many requests from this IP, please try again after 15 minutes.',
	},
	headers: true, // Send rate limit headers with the response (e.g., X-RateLimit-Limit, X-RateLimit-Remaining)
});

module.exports = limiter;
