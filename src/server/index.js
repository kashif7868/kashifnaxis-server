const mongoose = require('mongoose');
const app = require('./app');
const config = require('../config/config');
const logger = require('../config/logger');

// Load environment variables
require('dotenv').config();

// MongoDB connection URL directly in the code
const mongodbUrl = process.env.MONGODB_URL;

// Connect to MongoDB Atlas
mongoose.connect(mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    logger.info('Successfully connected to MongoDB Atlas');
    const server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);  // Exit the process on failure
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
