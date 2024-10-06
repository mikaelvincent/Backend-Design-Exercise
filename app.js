require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware'); // Import rate limiter

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(loggerMiddleware);
app.use(rateLimitMiddleware);

// Routes
app.use('/api', userRoutes);

// Start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
