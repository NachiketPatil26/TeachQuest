require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Branch = require('../models/Branch');

async function initTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');

    // Create admin if not exists
    const adminExists = await Admin.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      await Admin.create({
        email: 'admin@gmail.com',
        password: 'admin123',
        name: 'Admin User'
      });
      console.log('Test admin created');
    }

    // Create test branches if not exist
    const branches = [
      { name: 'Computer Science and Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' },
      { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
      { name: 'Artificial Intelligence & Data Science', code: 'AIDS', description: 'Department of AI and Data Science' }
    ];

    for (const branchData of branches) {
      const branchExists = await Branch.findOne({ code: branchData.code });
      if (!branchExists) {
        await Branch.create(branchData);
        console.log(`${branchData.code} branch created`);
      }
    }

    // Create test teachers if not exist
    const teachers = [
      { name: 'John Smith', email: 'john@gmail.com', department: 'CSE' },
      { name: 'Sarah Johnson', email: 'sarah@gmail.com', department: 'IT' },
      { name: 'Mike Wilson', email: 'mike@gmail.com', department: 'AIDS' }
    ];
    
    for (const teacherData of teachers) {
      const teacherExists = await Teacher.findOne({ email: teacherData.email });
      if (!teacherExists) {
        await Teacher.create({
          ...teacherData,
          password: 'teacher123',
          availability: [{
            date: new Date(),
            timeSlots: ['09:00', '14:00'],
            isAvailable: true
          }]
        });
        console.log(`Test teacher ${teacherData.name} created`);
      }
    }

    console.log('Test data initialization completed');
  } catch (error) {
    console.error('Error initializing test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initTestData();