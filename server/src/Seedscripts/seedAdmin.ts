import mongoose from 'mongoose';
import User from '../models/User';
import * as dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachquest');
    console.log('Connected to MongoDB');

    const email = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const adminExists = await User.findOne({ email });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Test Admin',
      email,
      password,
      role: 'admin',
      phone: '1234567890'
    });

    console.log('Admin user created successfully:', {
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();