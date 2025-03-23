import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import Exam from '../models/Exam';

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
        user.availability = req.body.availability || user.availability;
        
        // Update subject expertise if provided
        if (req.body.subjectExpertise) {
          user.subjectExpertise = req.body.subjectExpertise;
        }
        
        // Update subject preferences if provided
        if (req.body.subjectPreferences) {
          user.subjectPreferences = req.body.subjectPreferences;
        }
        
        // Update time preferences if provided
        if (req.body.timePreferences) {
          user.timePreferences = req.body.timePreferences;
        }
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
        subjectExpertise: updatedUser.subjectExpertise,
        subjectPreferences: updatedUser.subjectPreferences,
        timePreferences: updatedUser.timePreferences,
        availability: updatedUser.availability,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    console.error('Update user profile error:', {
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

export const getTeacherAllocations = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id || req.user?.id;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }

    // Find all exams where this teacher is allocated
    const exams = await Exam.find({
      $or: [
        { allocatedTeachers: teacherId },
        { 'blocks.invigilator': teacherId }
      ]
    }).populate('blocks.invigilator', 'name email').sort({ date: 1, startTime: 1 });
    
    res.json(exams);
  } catch (error: any) {
    console.error('Get teacher allocations error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

// Update teacher expertise levels
export const updateTeacherExpertise = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id || req.user?.id;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    
    const { subjectExpertise } = req.body;
    
    if (!subjectExpertise || !Array.isArray(subjectExpertise)) {
      return res.status(400).json({ message: 'Subject expertise data is required and must be an array' });
    }
    
    // Validate expertise data
    for (const entry of subjectExpertise) {
      if (!entry.subject || typeof entry.level !== 'number' || entry.level < 1 || entry.level > 5) {
        return res.status(400).json({ 
          message: 'Each expertise entry must have a subject name and level between 1-5' 
        });
      }
    }
    
    const user = await User.findById(teacherId);
    
    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }
    
    user.subjectExpertise = subjectExpertise;
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      subjectExpertise: user.subjectExpertise
    });
  } catch (error: any) {
    console.error('Update teacher expertise error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

// Update teacher preferences
export const updateTeacherPreferences = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id || req.user?.id;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    
    const { subjectPreferences, timePreferences } = req.body;
    
    if ((!subjectPreferences || !Array.isArray(subjectPreferences)) && 
        (!timePreferences || !Array.isArray(timePreferences))) {
      return res.status(400).json({ 
        message: 'At least one of subject preferences or time preferences must be provided as arrays' 
      });
    }
    
    const user = await User.findById(teacherId);
    
    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }
    
    // Update subject preferences if provided
    if (subjectPreferences && Array.isArray(subjectPreferences)) {
      // Validate subject preferences
      for (const entry of subjectPreferences) {
        if (!entry.subject || typeof entry.preference !== 'number' || 
            entry.preference < 1 || entry.preference > 5) {
          return res.status(400).json({ 
            message: 'Each subject preference entry must have a subject name and preference level between 1-5' 
          });
        }
      }
      user.subjectPreferences = subjectPreferences;
    }
    
    // Update time preferences if provided
    if (timePreferences && Array.isArray(timePreferences)) {
      // Validate time preferences
      for (const entry of timePreferences) {
        if (!entry.slot || typeof entry.preference !== 'number' || 
            entry.preference < 1 || entry.preference > 5) {
          return res.status(400).json({ 
            message: 'Each time preference entry must have a time slot and preference level between 1-5' 
          });
        }
      }
      user.timePreferences = timePreferences;
    }
    
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      subjectPreferences: user.subjectPreferences,
      timePreferences: user.timePreferences
    });
  } catch (error: any) {
    console.error('Update teacher preferences error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};