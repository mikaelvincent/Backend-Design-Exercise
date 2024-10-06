const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');

const secretKey = process.env.SECRET_KEY || 'default_secret_key';

const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

exports.register = (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password } = req.body;
  const userExists = userModel.findUserByUsername(username);
  if (userExists) return res.status(409).json({ message: 'Username already exists.' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const users = userModel.getAllUsers();
  const newUser = { id: users.length + 1, username, email, password: hashedPassword };
  userModel.addUser(newUser);
  res.status(201).json({ message: 'User registered successfully.', user: newUser });
};

exports.login = (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, password } = req.body;
  const user = userModel.findUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials.' });

  const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful.', token });
};

exports.getProfile = (req, res) => {
  const userId = req.userId;
  const user = userModel.findUserById(userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  res.status(200).json({ user });
};

exports.changePassword = (req, res) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const userId = req.userId;
  const user = userModel.findUserById(userId);
  if (!user || !bcrypt.compareSync(req.body.oldPassword, user.password))
    return res.status(400).json({ message: 'Invalid old password.' });

  user.password = bcrypt.hashSync(req.body.newPassword, 10);
  const updated = userModel.updateUser(user);
  if (updated) {
    res.status(200).json({ message: 'Password changed successfully.' });
  } else {
    res.status(500).json({ message: 'Failed to update password.' });
  }
};
