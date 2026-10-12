import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB(customUri?: string): Promise<typeof mongoose> {
  const uri = customUri || config.mongodbUri;
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
