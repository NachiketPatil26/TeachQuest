import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('Login failed: Missing credentials');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.warn(`Login failed: No user found with email ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn(`Login failed: Invalid password for user ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`Login successful: ${email}`);
    const token = generateToken(user._id);
      
      // Add token to user's tokens array
      user.tokens = user.tokens || [];
      user.tokens.push({ token });
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        subjects: user.subjects,
        remuneration: user.remuneration,
        token
      });
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ message: 'Server error' });
    }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, branch, subjects } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      branch: role === 'teacher' ? branch : undefined,
      subjects: role === 'teacher' ? subjects : undefined,
      remuneration: 0
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      
      if (user.role === 'teacher') {
        user.branch = req.body.branch || user.branch;
        user.subjects = req.body.subjects || user.subjects;
      }

      if (req.body.password) {
        user.password = req.body.password;
        user.markModified('password');
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        subjects: updatedUser.subjects,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password -tokens')
      .lean();

    if (!teachers) {
      return res.status(404).json({ message: 'No teachers found' });
    }

    res.json(teachers);
  } catch (error: any) {
    console.error('Get teachers error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getTeachers
};