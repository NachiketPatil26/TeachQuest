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
        department: user.department,
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
    const { name, email, password, role, phone, branch, department, subjects } = req.body;

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
      department: role === 'teacher' ? department : undefined,
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
        user.department = req.body.department || user.department;
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
        department: updatedUser.department,
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

    // Verify if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Find all exams where this teacher is allocated
    const exams = await Exam.find({
      $or: [
        { allocatedTeachers: teacherId },
        { 'blocks.invigilator': teacherId }
      ],
      date: { $gte: new Date() } // Only fetch upcoming and current exams
    })
    .populate('blocks.invigilator', 'name email')
    .populate('subject')
    .sort({ date: 1, startTime: 1 });
    
    if (!exams) {
      return res.status(404).json({ message: 'No allocations found for this teacher' });
    }

    res.json(exams);
  } catch (error: any) {
    console.error('Get teacher allocations error:', {
      message: error.message,
      stack: error.stack,
      teacherId: req.params.id || req.user?.id
    });

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }

    res.status(500).json({ 
      message: 'Failed to fetch teacher allocations. Please try again later.'
    });
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

// Create a new teacher
export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, branch, department, subjects, remuneration } = req.body;

    // Validate required fields
    if (!name || !email || !password || !branch || !department || !subjects) {
      return res.status(400).json({
        message: 'Please provide all required fields: name, email, password, branch, department, and subjects'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate subjects array
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one subject' });
    }

    // Create the teacher
    const teacher = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'teacher',
      phone: phone?.trim(),
      branch,
      department: department.trim(),
      subjects: subjects.map(subject => subject.trim()),
      remuneration: remuneration || 0,
      active: true
    });

    if (teacher) {
      res.status(201).json({
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        phone: teacher.phone,
        branch: teacher.branch,
        department: teacher.department,
        subjects: teacher.subjects,
        remuneration: teacher.remuneration
      });
    } else {
      res.status(400).json({ message: 'Invalid teacher data' });
    }
  } catch (error: any) {
    console.error('Create teacher error:', {
      message: error.message,
      stack: error.stack
    });
    
    // Send more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    } else if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a teacher
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    
    const teacher = await User.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }
    
    // Delete the teacher
    await User.findByIdAndDelete(teacherId);
    
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error: any) {
    console.error('Delete teacher error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

// Update teacher information
// Get teacher statistics
export const getTeacherStats = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id || req.user?.id;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    
    const user = await User.findById(teacherId);
    
    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    // Get all exams where this teacher is allocated
    const exams = await Exam.find({
      $or: [
        { allocatedTeachers: teacherId },
        { 'blocks.invigilator': teacherId }
      ]
    });

    const now = new Date();
    
    // Calculate statistics
    const stats = {
      totalAllocations: exams.length,
      upcomingDuties: exams.filter(exam => new Date(exam.date) > now).length,
      completedDuties: exams.filter(exam => new Date(exam.date) < now).length,
      currentDuties: exams.filter(exam => {
        const examDate = new Date(exam.date);
        return examDate.getDate() === now.getDate() &&
               examDate.getMonth() === now.getMonth() &&
               examDate.getFullYear() === now.getFullYear();
      }).length,
      subjectWiseAllocations: {},
      branchWiseAllocations: {}
    };

    // Calculate subject-wise and branch-wise allocations
    exams.forEach(exam => {
      // Subject-wise allocations
      if (stats.subjectWiseAllocations[exam.subject]) {
        stats.subjectWiseAllocations[exam.subject]++;
      } else {
        stats.subjectWiseAllocations[exam.subject] = 1;
      }

      // Branch-wise allocations
      if (stats.branchWiseAllocations[exam.branch]) {
        stats.branchWiseAllocations[exam.branch]++;
      } else {
        stats.branchWiseAllocations[exam.branch] = 1;
      }
    });

    res.json(stats);
  } catch (error: any) {
    console.error('Get teacher stats error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    
    const user = await User.findById(teacherId);
    
    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }
    
    // Update basic teacher information
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.branch) user.branch = req.body.branch;
    if (req.body.department) user.department = req.body.department;
    if (req.body.subjects) user.subjects = req.body.subjects;
    if (req.body.remuneration) user.remuneration = req.body.remuneration;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      branch: updatedUser.branch,
      department: updatedUser.department,
      subjects: updatedUser.subjects,
      remuneration: updatedUser.remuneration
    });
  } catch (error: any) {
    console.error('Update teacher error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teacher upcoming duties
export const getTeacherUpcomingDuties = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id || req.user?.id;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }

    // Verify if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    // Get limit parameter from query string
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Find all exams where this teacher is allocated
    let query = Exam.find({
      $or: [
        { allocatedTeachers: teacherId },
        { 'blocks.invigilator': teacherId }
      ],
      date: { $gte: new Date() } // Only fetch upcoming exams
    })
    .populate('blocks.invigilator', 'name email')
    .sort({ date: 1, startTime: 1 });
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const exams = await query.exec();
    
    // Format the response to match the client expectations
    const duties = exams.map(exam => ({
      _id: exam._id,
      subject: exam.subject,
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: exam.status,
      examName: exam.examName,
      branch: exam.branch,
      semester: exam.semester,
      blocks: exam.blocks
    }));

    res.json(duties);
  } catch (error: any) {
    console.error('Get teacher upcoming duties error:', {
      message: error.message,
      stack: error.stack,
      teacherId: req.params.id || req.user?.id
    });

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }

    res.status(500).json({ 
      message: 'Failed to fetch upcoming duties. Please try again later.'
    });
  }
};
