import mongoose from 'mongoose';
import Exam from '../models/Exam';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachquest';

const branches = ['Computer Science', 'Mechanical', 'Civil', 'Electronics'];
const subjects = {
  'Computer Science': ['Data Structures', 'Operating Systems', 'Database Management', 'Computer Networks'],
  'Mechanical': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Heat Transfer'],
  'Civil': ['Structural Analysis', 'Geotechnical Engineering', 'Transportation Engineering', 'Environmental Engineering'],
  'Electronics': ['Digital Electronics', 'Analog Circuits', 'Microprocessors', 'Communication Systems']
};

const generateRandomTime = () => {
  const hours = Math.floor(Math.random() * (16 - 9) + 9); // Between 9 AM and 4 PM
  return `${hours.toString().padStart(2, '0')}:00`;
};

const generateExamData = () => {
  const examData = [];
  const startDate = new Date();
  const dummyTeacherId = new mongoose.Types.ObjectId(); // Create a dummy teacher ID
  
  branches.forEach(branch => {
    subjects[branch].forEach(subject => {
      // Generate 3 exams per subject spread over next 3 months
      for (let i = 0; i < 3; i++) {
        const examDate = new Date(startDate);
        examDate.setDate(examDate.getDate() + Math.floor(Math.random() * 90)); // Random date within next 90 days
        
        const startTime = generateRandomTime();
        let endTimeHour = parseInt(startTime.split(':')[0]) + 3;
        const endTime = `${endTimeHour.toString().padStart(2, '0')}:00`;

        examData.push({
          branch,
          subject,
          date: examDate,
          startTime,
          endTime,
          blocks: [
            {
              number: 1,
              capacity: 30,
              location: 'Room 101',
              status: 'pending',
              invigilator: dummyTeacherId
            },
            {
              number: 2,
              capacity: 30,
              location: 'Room 102',
              status: 'pending',
              invigilator: dummyTeacherId
            }
          ],
          allocatedTeachers: [], // Will be populated later
          createdBy: dummyTeacherId
        });
      }
    });
  });

  return examData;
};

const populateExams = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing exams
    await Exam.deleteMany({});
    console.log('Cleared existing exams');

    // Generate and insert new exam data
    const examData = generateExamData();
    await Exam.insertMany(examData);

    console.log(`Successfully populated database with ${examData.length} exams`);
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
};

populateExams();