import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Branch, { ISubject } from '../models/Branch';
import User from '../models/User';

// Get all branches
export const getBranches = async (req: Request, res: Response) => {
  try {
    const branches = await Branch.find().populate('teachers', 'name email active');
    res.status(200).json(branches);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
};

// Get branch by ID
export const getBranchById = async (req: Request, res: Response) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('teachers', 'name email active');
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.status(200).json(branch);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching branch', error: error.message });
  }
};

// Create new branch
export const createBranch = async (req: Request, res: Response) => {
  try {
    const { name, subjects, active = true } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Branch name is required' });
    }

    const branchExists = await Branch.findOne({ name });
    if (branchExists) {
      return res.status(400).json({ message: 'Branch with this name already exists' });
    }

    // Validate subjects array
    if (subjects && !Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Subjects must be an array' });
    }

    const branch = await Branch.create({
      name,
      subjects: subjects || [],
      teachers: [],
      active
    });

    res.status(201).json(branch);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating branch', error: error.message });
  }
};

// Update branch
export const updateBranch = async (req: Request, res: Response) => {
  try {
    const { name, subjects, active } = req.body;
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    if (name && name !== branch.name) {
      const branchExists = await Branch.findOne({ name });
      if (branchExists) {
        return res.status(400).json({ message: 'Branch with this name already exists' });
      }
      branch.name = name;
    }

    if (subjects) {
      if (!Array.isArray(subjects)) {
        return res.status(400).json({ message: 'Subjects must be an array' });
      }
      branch.subjects = subjects;
    }

    if (typeof active === 'boolean') {
      branch.active = active;
    }

    await branch.save();
    res.status(200).json(branch);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating branch', error: error.message });
  }
};

// Add teacher to branch
export const addTeacherToBranch = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.body;
    const branch = await Branch.findById(req.params.id);
    const teacher = await User.findById(teacherId);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    if (!teacher.active) {
      return res.status(400).json({ message: 'Teacher is not active' });
    }

    if (branch.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher already assigned to this branch' });
    }

    branch.teachers.push(teacherId);
    await branch.save();

    res.status(200).json(branch);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding teacher to branch', error: error.message });
  }
};

// Remove teacher from branch
export const removeTeacherFromBranch = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.body;
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    if (!branch.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher not assigned to this branch' });
    }

    branch.teachers == branch.teachers.filter((id) => id.toString() !== teacherId.toString());
    await branch.save();

    res.status(200).json(branch);
  } catch (error: any) {
    res.status(500).json({ message: 'Error removing teacher from branch', error: error.message });
  }
};