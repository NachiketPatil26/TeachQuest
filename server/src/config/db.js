const mongoose = require('mongoose');
const { Branch, Subject, Teacher, Exam, Duty } = require('../models/schema');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize default branches if none exist
    const branchCount = await Branch.countDocuments();
    if (branchCount === 0) {
      const defaultBranches = [
        { name: 'Computer Science', code: 'CS' },
        { name: 'Mechanical', code: 'ME' },
        { name: 'Electrical', code: 'EE' },
        { name: 'Civil', code: 'CE' },
        { name: 'Electronics', code: 'EC' }
      ];

      await Branch.insertMany(defaultBranches);
      console.log('Default branches initialized');
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;