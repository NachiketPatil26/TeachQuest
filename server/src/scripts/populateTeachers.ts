import mongoose from 'mongoose';
import * as  dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

// Sample subjects that align with exam subjects
const subjects = [
  'AOA',
  'Physics',
  'Chemistry',
  'DBMS',
  'Computer Science',
  'English',
  'History',
  'Geography'
];

// Sample teacher data
// Generate random dates for teacher availability
const generateAvailabilityDays = () => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return weekdays.filter(() => Math.random() > 0.3); // 70% chance of being available on any day
};

const teacherData = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@teachquest.edu',
    password: 'password123', // This should be changed in production
    role: 'teacher',
    subjects: ['Mathematics', 'AOA'],
    active: true,
    phone: '123-456-7890',
    availability: generateAvailabilityDays(),
    remuneration: 1000
  },
  {
    name: 'Prof. Michael Chen',
    email: 'michael.chen@teachquest.edu',
    password: 'password123',
    role: 'teacher',
    subjects: ['Chemistry', 'DBMS'],
    active: true,
    phone: '123-456-7891',
    availability: generateAvailabilityDays(),
    remuneration: 1000
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@teachquest.edu',
    password: 'password123',
    role: 'teacher',
    subjects: ['Computer Science', 'Mathematics'],
    active: true,
    phone: '123-456-7892',
    availability: generateAvailabilityDays(),
    remuneration: 1000
  },
  {
    name: 'Prof. David Kim',
    email: 'david.kim@teachquest.edu',
    password: 'password123',
    role: 'teacher',
    subjects: ['Physics', 'Chemistry'],
    active: true,
    phone: '123-456-7893',
    availability: generateAvailabilityDays(),
    remuneration: 1000
  },
  {
    name: 'Dr. Lisa Thompson',
    email: 'lisa.thompson@teachquest.edu',
    password: 'password123',
    role: 'teacher',
    subjects: ['English', 'CS'],
    active: true,
    phone: '123-456-7894',
    availability: generateAvailabilityDays(),
    remuneration: 1000
  },
  {
    name: 'Prof. James Wilson',
    email: 'james.wilson@teachquest.edu',
    password: 'password123',
    role: 'teacher',
    subjects: ['Geography', 'History'],
    active: true,
    phone: '123-456-7895',
    availability: generateAvailabilityDays(),
    remuneration: 1000
  },
  {
    name: 'Dr. Maria Garcia',
    email: 'maria.garcia@teachquest.edu',
    password: 'password123',
    role: 'teacher',
    subjects: ['Biology', 'Chemistry'],
    active: true,
    phone: '123-456-7896',
    availability: generateAvailabilityDays(),
    remuneration: 1000
  },
  {
    name: 'Prof. Robert Taylor',
    email: 'robert.taylor@teachquest.edu',
    password: 'password123',
    role: 'teacher',
    subjects: ['Computer Science', 'Mathematics'],
    active: true,
    phone: '123-456-7897',
    availability: generateAvailabilityDays(),
    remuneration: 1000
  }
];

async function populateTeachers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachquest');
    console.log('Connected to MongoDB');

    // Clear existing teachers
    await User.deleteMany({ role: 'teacher' });
    console.log('Cleared existing teachers');

    // Insert new teachers using create() to trigger middleware
    const teachers = [];
    for (const data of teacherData) {
      const teacher = await User.create(data);
      teachers.push(teacher);
      console.log(`Added teacher: ${teacher.name} (${teacher.email})`);
      console.log(`Subjects: ${teacher.subjects?.join(', ')}`);
      console.log('---');
    }
    console.log(`Successfully inserted ${teachers.length} teachers`);

  } catch (error) {
    console.error('Error populating teachers:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the population script
populateTeachers();