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
// Generate all weekdays for teacher availability
const generateAvailabilityDays = () => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return weekdays; // All teachers available on all days
};

const teacherData = [

  {
    name: 'Mrs. Deepti Jeetu Janjani',
    email: 'deepti@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['ML', 'AI','AOA'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7892',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mrs.Monal Nilesh Malge',
    email: 'monal@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['DLCOA', 'MP'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7893',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mrs. Irin Anna Solomone',
    email: 'irun@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['DGST', 'CS'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7894',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mrs. Amita Priyadarshan Su',
    email: 'amita@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['AI', 'DBMS'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7895',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mrs. Anjali Devi Milind Patil',
    email: 'anjali@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['SBLC', 'OS'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7896',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mrs. Aarti Raman Sonawane',
    email: 'aarti@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['MP', 'OS'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7897',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mrs. Poonam Amit Kamble',
    email: 'poonam@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['Python', 'DTS'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7897',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mrs. Shraddha Anant Narhari(Kawji)',
    email: 'shraddha@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['DGST', 'CG'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7897',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mrs. Aarpita',
    email: 'aarpita@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['AOA', 'Maths'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7897',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
    remuneration: 1000
  },
  {
    name: 'Mr Mazhar Sheikh',
    email: 'mazhar@gmail.com',
    password: 'password123',
    role: 'teacher',
    subjects: ['Maths'],
    department: 'Computer Science',
    active: true,
    phone: '123-456-7897',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',],
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