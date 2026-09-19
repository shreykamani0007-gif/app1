import mongoose from 'mongoose';

let memoryServerInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clubops';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] External connection failed (${error.message}).`);
    console.log('[MongoDB] Initializing embedded MongoDB server...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri('clubops');
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] Embedded database connected successfully: ${memUri}`);
      return conn;
    } catch (memError) {
      console.error(`[MongoDB] Failed to start embedded database: ${memError.message}`);
    }
  }
};

export default connectDB;
