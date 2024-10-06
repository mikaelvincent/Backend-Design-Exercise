const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const loggerMiddleware = require('./middleware/loggerMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(loggerMiddleware);

// Routes
app.use('/api', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
