import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Exam from '../models/Exam';

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Make sure we have the MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

async function seedExamData() {
  try {
    // Connect to MongoDB Atlas
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully to MongoDB Atlas');
    
    // Print current database name
    const dbName = mongoose.connection.db.databaseName;
    console.log('Connected to database:', dbName);

    // Clear existing data
    console.log('Clearing existing exam data...');
    await Exam.deleteMany({});
    console.log('Existing exam data cleared');

    // Read the transformed JSON file
    const jsonPath = path.join(__dirname, '../data/transformed-exams.json');
    const examData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Found ${examData.length} exams in JSON file`);

    // Insert the exam data
    console.log('Seeding exam data...');
    const result = await Exam.insertMany(examData);
    console.log(`Successfully seeded ${result.length} exam records`);
    
    // Verify the insertion
    const finalCount = await Exam.countDocuments();
    console.log(`Final exam count in database: ${finalCount}`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedExamData(); 