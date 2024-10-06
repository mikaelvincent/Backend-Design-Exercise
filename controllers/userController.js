const users = require('../models/userModel');
const jwt = require('jsonwebtoken');

const secretKey = 'temp_secret_key';

// Register a new user
exports.register = (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // Check if user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: 'Username already exists.' });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password,
  };

  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully.', user: newUser });
};

// User login
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password.' });
  }

  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
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
