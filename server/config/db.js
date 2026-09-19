import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clubops';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000, // Timeout fast if no local MongoDB running
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Connection failed: ${error.message}`);
    console.warn('[MongoDB] Running without active database connection. Start MongoDB or update MONGODB_URI in .env.');
  }
};

export default connectDB;
