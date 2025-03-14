import { Request, Response } from 'express';
import User from '../models/User';
import Exam from '../models/Exam';
import mongoose from 'mongoose';

// Get teacher's upcoming duties
export const getTeacherDuties = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get current date
    const currentDate = new Date();
    
    // Find exams where this teacher is allocated and the date is in the future
    const upcomingDuties = await Exam.find({
      allocatedTeachers: teacherId,
      date: { $gte: currentDate }
    }).sort({ date: 1, startTime: 1 });

    res.status(200).json(upcomingDuties);
  } catch (error) {
    console.error('Error fetching teacher duties:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teacher's past duties
export const getTeacherDutyHistory = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get current date
    const currentDate = new Date();
    
    // Find exams where this teacher is allocated and the date is in the past
    const pastDuties = await Exam.find({
      allocatedTeachers: teacherId,
      date: { $lt: currentDate }
    }).sort({ date: -1, startTime: 1 });

    res.status(200).json(pastDuties);
  } catch (error) {
    console.error('Error fetching teacher duty history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teacher's dashboard stats
export const getTeacherStats = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get current date
    const currentDate = new Date();
    
    // Count upcoming duties
    const upcomingDutiesCount = await Exam.countDocuments({
      allocatedTeachers: teacherId,
      date: { $gte: currentDate }
    });

    // Count completed duties
    const completedDutiesCount = await Exam.countDocuments({
      allocatedTeachers: teacherId,
      date: { $lt: currentDate }
    });

    // Count pending reports (placeholder - would need a Report model)
    const pendingReportsCount = 2; // Placeholder value

    res.status(200).json({
      upcomingDuties: upcomingDutiesCount,
      completedDuties: completedDutiesCount,
      pendingReports: pendingReportsCount
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit a duty report
export const submitDutyReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const { examId, comments, issues } = req.body;

    if (!teacherId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!examId || !comments) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if the exam exists and the teacher is allocated to it
    const exam = await Exam.findOne({
      _id: examId,
      allocatedTeachers: teacherId
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or you are not allocated to this exam' });
    }

    // In a real implementation, you would create a Report model
    // For now, we'll just return success
    res.status(200).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting duty report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teacher's remuneration details
export const getTeacherRemuneration = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get current date
    const currentDate = new Date();
    
    // Count completed duties for remuneration calculation
    const completedDuties = await Exam.countDocuments({
      allocatedTeachers: teacherId,
      date: { $lt: currentDate }
    });

    // Mock remuneration data
    const remunerationData = {
      totalDuties: completedDuties,
      ratePerDuty: 500, // Example rate in rupees
      totalAmount: completedDuties * 500,
      paidAmount: Math.floor(completedDuties * 500 * 0.7), // Example: 70% paid
      pendingAmount: Math.ceil(completedDuties * 500 * 0.3), // Example: 30% pending
      lastPaymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
      paymentHistory: [
        {
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.floor(completedDuties * 500 * 0.4),
          status: 'Paid'
        },
        {
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.floor(completedDuties * 500 * 0.3),
          status: 'Paid'
        }
      ]
    };

    res.status(200).json(remunerationData);
  } catch (error) {
    console.error('Error fetching teacher remuneration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};