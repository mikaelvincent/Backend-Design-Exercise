const users = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// Use the secret key from environment variables
const secretKey = process.env.SECRET_KEY;

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Register a new user
exports.register = (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, email, password } = req.body;

  // Check if user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: 'Username already exists.' });
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password: hashedPassword, // Store hashed password
  };

  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully.', user: newUser });
};

// User login
exports.login = (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password } = req.body;

  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // Compare passwords
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // Generate token
  const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });

  res.status(200).json({ message: 'Login successful.', token });
};

// Get user profile
exports.getProfile = (req, res) => {
  const userId = req.userId; // Set by authMiddleware

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.status(200).json({ user });
};
