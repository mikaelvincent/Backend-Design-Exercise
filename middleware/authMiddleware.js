/**
 * Authentication middleware that validates JWT tokens.
 * 
 * This middleware is used to protect routes that require user authentication.
 * It checks the 'Authorization' header for a valid JWT token and verifies the token
 * using the secret key. If the token is valid, the user's ID is extracted and attached 
 * to the request object for further use in the controller.
 * 
 * Environment Variables:
 * - `SECRET_KEY`: Secret key used for signing/verifying JWT tokens.
 * 
 * Errors:
 * - 403: No token provided in the 'Authorization' header.
 * - 401: Token is invalid or expired.
 * 
 * @param {Object} req    - The HTTP request object.
 * @param {Object} res    - The HTTP response object.
 * @param {Function} next - Function to pass control to the next middleware.
 */

const jwt = require('jsonwebtoken');

// Retrieve the JWT secret key from environment variables or use a default value
const secretKey = process.env.SECRET_KEY || 'default_secret_key';

module.exports = (req, res, next) => {
	const authHeader = req.headers['authorization'];

	// Check if the 'Authorization' header is present and starts with 'Bearer '
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(403).json({
			message: 'No token provided.'
		});
	}

	// Extract the token from the 'Authorization' header
	const token = authHeader.split(' ')[1];

	// Verify the token using the secret key
	jwt.verify(token, secretKey, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				message: 'Failed to authenticate token.'
			});
		}

		// Attach the decoded user ID to the request object for use in protected routes
		req.userId = decoded.id;
		next(); // Pass control to the next middleware or route handler
	});
};
