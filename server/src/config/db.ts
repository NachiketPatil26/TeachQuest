import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();


const MONGODB_URI = "mongodb+srv://nachiketpa26:jsm@cluster1.yrefb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1" || process.env.MONGODB_URI;


export const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Atlas Connection Successful!');
    console.log('MongoDB Connection Details:', {
      host: conn.connection.host,
      database: conn.connection.name,
      port: conn.connection.port,
      readyState: conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  } catch (error: any) {
    console.error('MongoDB Connection Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  }
};
