/**
 * This file defines the routes for user-related operations such as 
 * registration, login, profile retrieval, and password change.
 * 
 * Each route is mapped to a corresponding controller function that implements
 * the business logic. Some routes are protected by authentication middleware,
 * ensuring that only authenticated users can access them.
 * 
 * Middleware:
 * - `authMiddleware`: Protects routes by verifying JWT tokens.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Route: POST /register
 * 
 * Registers a new user by invoking the register function in the controller.
 * Expects a request body containing the user's username, email, and password.
 * 
 * Input Validation:
 * - Username, email, and password are validated within the controller.
 */
router.post('/register', userController.register);

/**
 * Route: POST /login
 * 
 * Logs in a user by validating their credentials (username and password).
 * If successful, it returns a JWT token for authenticated access.
 * 
 * Input Validation:
 * - Username and password are validated within the controller.
 */
router.post('/login', userController.login);

/**
 * Route: GET /profile
 * 
 * Retrieves the profile details of the authenticated user.
 * Protected by authentication middleware that verifies the user's JWT token.
 * 
 * Middleware:
 * - `authMiddleware`: Ensures the request is made by an authenticated user.
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * Route: PUT /change-password
 * 
 * Allows an authenticated user to change their password. The user must provide
 * their current password and a new password. The current password is verified,
 * and the new password is hashed before updating.
 * 
 * Middleware:
 * - `authMiddleware`: Ensures the request is made by an authenticated user.
 * 
 * Input Validation:
 * - Old and new passwords are validated within the controller.
 */
router.put('/change-password', authMiddleware, userController.changePassword);

module.exports = router;
