import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam';
import User from '../models/User';

// Get teacher workload analytics
export const getTeacherWorkloadAnalytics = async (req: Request, res: Response) => {
  try {
    const { branch } = req.params;
    
    if (!branch) {
      return res.status(400).json({ message: 'Branch parameter is required' });
    }

    // Get all teachers from the branch
    const teachers = await User.find({ 
      role: 'teacher',
      branch: branch,
      active: true
    }).select('_id name email');

    // Get all exams for the branch
    const exams = await Exam.find({ branch });

    // Calculate teacher workload
    const teacherWorkload = teachers.map(teacher => {
      // Count how many times this teacher appears in allocatedTeachers across all exams
      const duties = exams.reduce((count, exam) => {
        return count + (exam.allocatedTeachers.includes(teacher._id) ? 1 : 0);
      }, 0);

      return {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        duties
      };
    }).sort((a, b) => b.duties - a.duties); // Sort by duties in descending order

    // Calculate workload distribution metrics
    const workloadMetrics = [
      { range: '0 duties', count: 0 },
      { range: '1-2 duties', count: 0 },
      { range: '3-5 duties', count: 0 },
      { range: '6+ duties', count: 0 },
    ];

    teacherWorkload.forEach(teacher => {
      const duties = teacher.duties;
      if (duties === 0) workloadMetrics[0].count++;
      else if (duties <= 2) workloadMetrics[1].count++;
      else if (duties <= 5) workloadMetrics[2].count++;
      else workloadMetrics[3].count++;
    });

    res.json({
      teacherWorkload,
      workloadMetrics,
      totalTeachers: teachers.length,
      averageDutiesPerTeacher: teachers.length > 0 
        ? (teacherWorkload.reduce((sum, item) => sum + item.duties, 0) / teachers.length).toFixed(1)
        : '0'
    });
  } catch (error) {
    console.error('Get teacher workload analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch teacher workload analytics', error: error.message });
  }
};

// Get subject distribution analytics
export const getSubjectDistributionAnalytics = async (req: Request, res: Response) => {
  try {
    const { branch } = req.params;
    const { semester } = req.query;
    
    if (!branch) {
      return res.status(400).json({ message: 'Branch parameter is required' });
    }

    // Build query object
    const query: any = { branch };
    
    // Add semester to query if provided
    if (semester) {
      const semesterNum = parseInt(semester as string, 10);
      if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
        return res.status(400).json({ message: 'Invalid semester value' });
      }
      query.semester = semesterNum;
    }

    // Get all exams for the branch and semester if specified
    const exams = await Exam.find(query);

    // Calculate subject distribution
    const subjectCounts: Record<string, number> = {};
    exams.forEach(exam => {
      subjectCounts[exam.subject] = (subjectCounts[exam.subject] || 0) + 1;
    });

    const subjectDistribution = Object.entries(subjectCounts).map(([subject, count]) => ({
      subject,
      count,
    }));

    res.json({
      subjectDistribution,
      totalExams: exams.length
    });
  } catch (error) {
    console.error('Get subject distribution analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch subject distribution analytics', error: error.message });
  }
};

// Get exam statistics
export const getExamStatistics = async (req: Request, res: Response) => {
  try {
    const { branch } = req.params;
    const { semester } = req.query;
    
    if (!branch) {
      return res.status(400).json({ message: 'Branch parameter is required' });
    }

    // Build query object
    const query: any = { branch };
    
    // Add semester to query if provided
    if (semester) {
      const semesterNum = parseInt(semester as string, 10);
      if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
        return res.status(400).json({ message: 'Invalid semester value' });
      }
      query.semester = semesterNum;
    }

    // Get all exams for the branch and semester if specified
    const exams = await Exam.find(query);

    // Calculate exam status distribution
    const statusCounts = {
      scheduled: 0,
      'in-progress': 0,
      completed: 0
    };

    exams.forEach(exam => {
      statusCounts[exam.status]++;
    });

    // Calculate exam statistics
    const statistics = {
      totalExams: exams.length,
      statusDistribution: [
        { status: 'Scheduled', count: statusCounts.scheduled },
        { status: 'In Progress', count: statusCounts['in-progress'] },
        { status: 'Completed', count: statusCounts.completed }
      ]
    };

    res.json(statistics);
  } catch (error) {
    console.error('Get exam statistics error:', error);
    res.status(500).json({ message: 'Failed to fetch exam statistics', error: error.message });
  }
};

// Get all analytics in one call
export const getAllAnalytics = async (req: Request, res: Response) => {
  try {
    const { branch } = req.params;
    const { semester } = req.query;
    
    if (!branch) {
      return res.status(400).json({ message: 'Branch parameter is required' });
    }

    // Build query object
    const query: any = { branch };
    
    // Add semester to query if provided
    if (semester) {
      const semesterNum = parseInt(semester as string, 10);
      if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
        return res.status(400).json({ message: 'Invalid semester value' });
      }
      query.semester = semesterNum;
    }

    // Get all teachers from the branch
    const teachers = await User.find({ 
      role: 'teacher',
      branch: branch,
      active: true
    }).select('_id name email');

    // Get all exams for the branch and semester if specified
    const exams = await Exam.find(query);

    // Calculate teacher workload
    const teacherWorkload = teachers.map(teacher => {
      // Count how many times this teacher appears in allocatedTeachers across all exams
      const duties = exams.reduce((count, exam) => {
        return count + (exam.allocatedTeachers.includes(teacher._id) ? 1 : 0);
      }, 0);

      return {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        duties
      };
    }).sort((a, b) => b.duties - a.duties); // Sort by duties in descending order

    // Calculate workload distribution metrics
    const workloadMetrics = [
      { range: '0 duties', count: 0 },
      { range: '1-2 duties', count: 0 },
      { range: '3-5 duties', count: 0 },
      { range: '6+ duties', count: 0 },
    ];

    teacherWorkload.forEach(teacher => {
      const duties = teacher.duties;
      if (duties === 0) workloadMetrics[0].count++;
      else if (duties <= 2) workloadMetrics[1].count++;
      else if (duties <= 5) workloadMetrics[2].count++;
      else workloadMetrics[3].count++;
    });

    // Calculate subject distribution
    const subjectCounts: Record<string, number> = {};
    exams.forEach(exam => {
      subjectCounts[exam.subject] = (subjectCounts[exam.subject] || 0) + 1;
    });

    const subjectDistribution = Object.entries(subjectCounts).map(([subject, count]) => ({
      subject,
      count,
    }));

    // Calculate exam status distribution
    const statusCounts = {
      scheduled: 0,
      'in-progress': 0,
      completed: 0
    };

    exams.forEach(exam => {
      statusCounts[exam.status]++;
    });

    res.json({
      teacherWorkload,
      workloadMetrics,
      totalTeachers: teachers.length,
      averageDutiesPerTeacher: teachers.length > 0 
        ? (teacherWorkload.reduce((sum, item) => sum + item.duties, 0) / teachers.length).toFixed(1)
        : '0',
      subjectDistribution,
      totalExams: exams.length,
      statusDistribution: [
        { status: 'Scheduled', count: statusCounts.scheduled },
        { status: 'In Progress', count: statusCounts['in-progress'] },
        { status: 'Completed', count: statusCounts.completed }
      ]
    });
  } catch (error) {
    console.error('Get all analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};