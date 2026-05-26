const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri || uri.includes('your-mongodb-uri-here')) {
    console.log('⚠ No valid MONGO_URI — running without DB persistence.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
}

module.exports = connectDB;
