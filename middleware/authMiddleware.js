const jwt = require('jsonwebtoken');
const secretKey = 'temp_secret_key';

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token.' });
    }

    // Save user ID for use in other routes
    req.userId = decoded.id;
    next();
  });
};
