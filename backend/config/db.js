const mongoose = require('mongoose');

// Connects to MongoDB using the URI from the .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // If the connection drops later, Mongoose will reconnect automatically
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;