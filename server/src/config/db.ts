import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB(customUri?: string): Promise<typeof mongoose> {
  const uri = customUri || config.mongodbUri;
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    const preview = uri.length > 20 ? `${uri.slice(0, 15)}...` : uri;
    console.error(
      `[Database Error] Invalid connection scheme for MONGODB_URI. Expected string to start with 'mongodb://' or 'mongodb+srv://'. Value starts with: "${preview}". Please check your Render Environment Variables.`
    );
  }
  try {
    const conn = await mongoose.connect(uri);
    if (config.nodeEnv !== 'test') {
      console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    }
    return conn;
  } catch (err) {
    console.error('[Database Error] Connection failed:', err);
    if (config.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
