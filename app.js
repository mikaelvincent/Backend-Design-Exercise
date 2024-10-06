/**
 * This file serves as the main entry point for the Node.js application. It is responsible 
 * for initializing the Express application, configuring middleware, setting up routes, 
 * and starting the server. The application uses middleware for logging, rate-limiting, 
 * and request parsing, with the main user-related functionality defined in external routes 
 * and controllers.
 *
 * Environment Variables:
 * - `PORT`: Specifies the port on which the server will run. Default is 3000.
 * - `SECRET_KEY`: Secret key used for JWT token generation and verification (handled in controllers).
 * - `RATE_LIMIT_MAX`: Maximum number of requests allowed in the rate-limiting window (configured in middleware).
 */

require('dotenv').config(); // Load environment variables from the .env file

const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');                              // User-related API routes
const loggerMiddleware = require('./middleware/loggerMiddleware');        // Middleware to log request details
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');  // Middleware to apply rate-limiting

const app = express();                  // Initialize the Express application
const PORT = process.env.PORT || 3000;  // Use the port from the environment or default to 3000

// Apply middleware for logging, request parsing, and rate limiting
app.use(bodyParser.json());   // Middleware to parse JSON request bodies
app.use(loggerMiddleware);    // Custom middleware for logging request details
app.use(rateLimitMiddleware); // Apply rate limiting to all requests

// Setup user-related routes under the /api path
app.use('/api', userRoutes);

// Start the server only if this file is executed directly (not required in test environments)
if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

module.exports = app; // Export the app for testing and other use cases
