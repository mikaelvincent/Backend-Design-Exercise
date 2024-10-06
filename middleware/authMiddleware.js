const jwt = require('jsonwebtoken');

// Use the secret key from environment variables
const secretKey = process.env.SECRET_KEY;

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check for token in Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token.' });
    }

    // Save user ID for use in other routes
    req.userId = decoded.id;
    next();
  });
};
