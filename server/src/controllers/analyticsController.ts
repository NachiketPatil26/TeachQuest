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

    // Get all teachers
    // Note: We're not filtering by branch here because teachers might not have branch field set
    // in their User document, but are instead associated with branches in the Branch collection
    const teachers = await User.find({ 
      role: 'teacher',
      active: true
    }).select('_id name email');

    // Get all exams for the branch
    const exams = await Exam.find({ branch });

    // Calculate teacher workload
    // Calculate teacher workload including both exam duties and block invigilation
    const teacherWorkload = teachers.map(teacher => {
      let totalDuties = 0;
      
      // Count exam duties (being in allocatedTeachers)
      exams.forEach(exam => {
        // Check if teacher is in allocatedTeachers by comparing string representations of ObjectIds
        const isAllocated = exam.allocatedTeachers.some(teacherId => 
          teacherId.toString() === teacher._id.toString()
        );
        
        if (isAllocated) {
          totalDuties++;
        }
        
        // Count block invigilation duties
        if (exam.blocks) {
          exam.blocks.forEach(block => {
            if (block.invigilator && block.invigilator.toString() === teacher._id.toString()) {
              totalDuties++;
            }
          });
        }
      });

      // Calculate completed and upcoming duties based on exam dates
      const now = new Date();
      let completedDuties = 0;
      let upcomingDuties = 0;
      
      exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const isAllocated = exam.allocatedTeachers.some(teacherId => 
          teacherId.toString() === teacher._id.toString()
        );
        
        if (isAllocated) {
          if (examDate < now) {
            completedDuties++;
          } else {
            upcomingDuties++;
          }
        }
        
        // Count block invigilation duties
        if (exam.blocks) {
          exam.blocks.forEach(block => {
            if (block.invigilator && block.invigilator.toString() === teacher._id.toString()) {
              if (examDate < now) {
                completedDuties++;
              } else {
                upcomingDuties++;
              }
            }
          });
        }
      });
      
      return {
        teacherId: teacher._id,
        teacherName: teacher.name,
        email: teacher.email,
        totalDuties: totalDuties,
        completedDuties: completedDuties,
        upcomingDuties: upcomingDuties
      };
    }).sort((a, b) => b.totalDuties - a.totalDuties); // Sort by duties in descending order

    // Calculate workload distribution metrics
    const workloadMetrics = [
      { range: '0 duties', count: 0 },
      { range: '1-2 duties', count: 0 },
      { range: '3-5 duties', count: 0 },
      { range: '6+ duties', count: 0 },
    ];

    teacherWorkload.forEach(teacher => {
      const duties = teacher.totalDuties;
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
        ? (teacherWorkload.reduce((sum, item) => sum + item.totalDuties, 0) / teachers.length).toFixed(1)
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
    const { branch, semester } = req.query;
    
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

    // Get all teachers
    // Note: We're not filtering by branch here because teachers might not have branch field set
    // in their User document, but are instead associated with branches in the Branch collection
    const teachers = await User.find({ 
      role: 'teacher',
      active: true
    }).select('_id name email');

    // Get all exams for the branch and semester if specified
    const exams = await Exam.find(query);

    // Calculate teacher workload
    // Calculate teacher workload including both exam duties and block invigilation
    const teacherWorkload = teachers.map(teacher => {
      let totalDuties = 0;
      
      // Count exam duties (being in allocatedTeachers)
      exams.forEach(exam => {
        // Check if teacher is in allocatedTeachers by comparing string representations of ObjectIds
        const isAllocated = exam.allocatedTeachers.some(teacherId => 
          teacherId.toString() === teacher._id.toString()
        );
        
        if (isAllocated) {
          totalDuties++;
        }
        
        // Count block invigilation duties
        if (exam.blocks) {
          exam.blocks.forEach(block => {
            if (block.invigilator && block.invigilator.toString() === teacher._id.toString()) {
              totalDuties++;
            }
          });
        }
      });

      // Calculate completed and upcoming duties based on exam dates
      const now = new Date();
      let completedDuties = 0;
      let upcomingDuties = 0;
      
      exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const isAllocated = exam.allocatedTeachers.some(teacherId => 
          teacherId.toString() === teacher._id.toString()
        );
        
        if (isAllocated) {
          if (examDate < now) {
            completedDuties++;
          } else {
            upcomingDuties++;
          }
        }
        
        // Count block invigilation duties
        if (exam.blocks) {
          exam.blocks.forEach(block => {
            if (block.invigilator && block.invigilator.toString() === teacher._id.toString()) {
              if (examDate < now) {
                completedDuties++;
              } else {
                upcomingDuties++;
              }
            }
          });
        }
      });
      
      return {
        teacherId: teacher._id,
        teacherName: teacher.name,
        email: teacher.email,
        totalDuties: totalDuties,
        completedDuties: completedDuties,
        upcomingDuties: upcomingDuties
      };
    }).sort((a, b) => b.totalDuties - a.totalDuties); // Sort by duties in descending order

    // Calculate workload distribution metrics
    const workloadMetrics = [
      { range: '0 duties', count: 0 },
      { range: '1-2 duties', count: 0 },
      { range: '3-5 duties', count: 0 },
      { range: '6+ duties', count: 0 },
    ];

    teacherWorkload.forEach(teacher => {
      const duties = teacher.totalDuties;
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
        ? (teacherWorkload.reduce((sum, item) => sum + item.totalDuties, 0) / teachers.length).toFixed(1)
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