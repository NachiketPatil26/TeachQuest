require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Branch = require('../models/Branch');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');

const initializeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create admin account if not exists
    const adminExists = await Admin.findOne({ email: 'admin@teachquest.com' });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        name: 'Admin User',
        email: 'admin@teachquest.com',
        password: adminPassword
      });
      console.log('Admin account created');
    } else {
      console.log('Admin account already exists');
    }

    // Create branches
    const branches = await Branch.create([
      { name: 'Computer Science', code: 'CSE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Electronics', code: 'ECE' },
      { name: 'Mechanical', code: 'MECH' }
    ]);

    // Create subjects for each branch
    const subjects = [];
    for (const branch of branches) {
      const branchSubjects = await Subject.create([
        {
          name: 'Data Structures',
          code: `${branch.code}101`,
          branch: branch._id,
          semester: 3,
          credits: 4
        },
        {
          name: 'Database Management',
          code: `${branch.code}102`,
          branch: branch._id,
          semester: 4,
          credits: 4
        }
      ]);
      subjects.push(...branchSubjects);
    }

    // Create test teachers
    const teachers = await Teacher.create([
      {
        name: 'John Doe',
        email: 'john@teachquest.com',
        password: await bcrypt.hash('teacher123', 10),
        department: 'Computer Science',
        subjects: subjects.slice(0, 2).map(s => s._id)
      },
      {
        name: 'Jane Smith',
        email: 'jane@teachquest.com',
        password: await bcrypt.hash('teacher123', 10),
        department: 'Information Technology',
        subjects: subjects.slice(2, 4).map(s => s._id)
      }
    ]);

    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();