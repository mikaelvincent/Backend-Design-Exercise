/**
 * This file defines the controller for user-related operations such as 
 * registration, login, profile retrieval, and password management.
 * It handles business logic and interacts with the user model.
 */

const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// JWT secret key from environment variables or a default value
const secretKey = process.env.SECRET_KEY || 'default_secret_key';

// Schema for validating registration data
const registerSchema = Joi.object({
	username: Joi.string().min(3).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

// Schema for validating login data
const loginSchema = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
});

// Schema for validating password change request
const changePasswordSchema = Joi.object({
	oldPassword: Joi.string().required(),
	newPassword: Joi.string().min(6).required(),
});

/**
 * Registers a new user.
 * 
 * Validates user input using Joi, checks for duplicate usernames, 
 * hashes the password using bcrypt, and stores the new user in the model.
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 */
exports.register = (req, res) => {
	// Validate registration data using Joi schema
	const {
		error
	} = registerSchema.validate(req.body);
	if (error) return res.status(400).json({
		message: error.details[0].message
	});

	const {
		username,
		email,
		password
	} = req.body;

	// Check if username already exists in the database
	const userExists = userModel.findUserByUsername(username);
	if (userExists) return res.status(409).json({
		message: 'Username already exists.'
	});

	// Hash the password before saving it
	const hashedPassword = bcrypt.hashSync(password, 10);
	const users = userModel.getAllUsers();

	// Construct new user object
	const newUser = {
		id: users.length + 1,
		username,
		email,
		password: hashedPassword,
	};

	// Save the new user to the mock database
	userModel.addUser(newUser);
	res.status(201).json({
		message: 'User registered successfully.',
		user: newUser,
	});
};

/**
 * Logs in a user by validating credentials.
 * 
 * Checks the user's username and password, then generates a JWT if credentials are valid.
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 */
exports.login = (req, res) => {
	// Validate login data using Joi schema
	const {
		error
	} = loginSchema.validate(req.body);
	if (error) return res.status(400).json({
		message: error.details[0].message
	});

	const {
		username,
		password
	} = req.body;

	// Find user by username
	const user = userModel.findUserByUsername(username);
	if (!user || !bcrypt.compareSync(password, user.password)) {
		return res.status(401).json({
			message: 'Invalid credentials.'
		});
	}

	// Generate JWT token for the user, expires in 1 hour
	const token = jwt.sign({
		id: user.id
	}, secretKey, {
		expiresIn: '1h'
	});

	res.status(200).json({
		message: 'Login successful.',
		token,
	});
};

/**
 * Retrieves the profile of the authenticated user.
 * 
 * Protected by authentication middleware. Fetches the user data based on the user ID from the token.
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 */
exports.getProfile = (req, res) => {
	const userId = req.userId; // Extracted from JWT by authentication middleware

	// Fetch the user from the model using user ID
	const user = userModel.findUserById(userId);
	if (!user) return res.status(404).json({
		message: 'User not found.'
	});

	res.status(200).json({
		user
	});
};

/**
 * Changes the password of the authenticated user.
 * 
 * Validates the old password, hashes the new password, and updates the user in the mock database.
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 */
exports.changePassword = (req, res) => {
	// Validate password change data using Joi schema
	const {
		error
	} = changePasswordSchema.validate(req.body);
	if (error) return res.status(400).json({
		message: error.details[0].message
	});

	const userId = req.userId; // Extracted from JWT by authentication middleware

	// Fetch the user from the model
	const user = userModel.findUserById(userId);
	if (!user || !bcrypt.compareSync(req.body.oldPassword, user.password)) {
		return res.status(400).json({
			message: 'Invalid old password.'
		});
	}

	// Hash the new password
	user.password = bcrypt.hashSync(req.body.newPassword, 10);

	// Update user data in the mock database
	const updated = userModel.updateUser(user);
	if (updated) {
		res.status(200).json({
			message: 'Password changed successfully.'
		});
	} else {
		res.status(500).json({
			message: 'Failed to update password.'
		});
	}
};
