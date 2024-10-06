/**
 * Middleware to log incoming HTTP requests.
 * 
 * This middleware logs the HTTP method, accessed route, and timestamp of each request.
 * It is invoked for every incoming request before any route handlers or other middleware are executed.
 * 
 * The log includes:
 * - HTTP method (e.g., GET, POST)
 * - Original route requested (e.g., /api/register)
 * - Timestamp when the request was made, formatted as ISO string
 * 
 * This can be useful for debugging, monitoring, or analytics purposes.
 * 
 * @param {Object} req		- The HTTP request object.
 * @param {Object} res		- The HTTP response object.
 * @param {Function} next	- Function to pass control to the next middleware or route handler.
 */
module.exports = (req, res, next) => {
	const method = req.method;					// Extract HTTP method (e.g., GET, POST)
	const route = req.originalUrl;				// Extract the original requested URL
	const timestamp = new Date().toISOString();	// Get current timestamp in ISO format

	// Log the request details to the console
	console.log(`[${timestamp}] ${method} ${route}`);

	next(); // Pass control to the next middleware or route handler
};
