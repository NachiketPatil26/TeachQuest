import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Exam from '../models/Exam';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachquest';

async function clearExamData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully to MongoDB');

    // Clear all exam records
    console.log('Clearing exam data...');
    const result = await Exam.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} exam records`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing exam data:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

clearExamData();