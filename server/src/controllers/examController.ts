import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam';
import Notification from '../models/Notification';
import User from '../models/User';
import { sendExamAllocationEmail } from '../services/emailService';

interface ExamRequest extends Request {
  user?: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
}

export const createExam = async (req: Request, res: Response) => {
  try {
    const { branch, semester, subject, date, startTime, endTime, examName } = req.body;
    
    if (!branch || !semester || !subject || !date || !startTime || !endTime || !examName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (semester < 1 || semester > 8) {
      return res.status(400).json({ message: 'Semester must be between 1 and 8' });
    }

    // Ensure subject is a string and handle subject object
    const subjectString = typeof subject === 'object' && subject.name ? subject.name : subject;
    if (!subjectString) {
      return res.status(400).json({ message: 'Invalid subject format' });
    }

    try {
      // Check if the exam already exists for the given branch, subject, date, and time
      const existingExam = await Exam.findOne({
        branch,
        subject: subjectString,
        date,
        $or: [
          { startTime: { $lte: startTime }, endTime: { $gte: startTime } },
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      });

      if (existingExam) {
        return res.status(400).json({ message: 'Exam already exists for the given time slot' });
      }

      const exam = await Exam.create({
        branch,
        semester,
        subject: subjectString,
        date,
        startTime,
        endTime,
        examName,
        status: 'scheduled',
        createdBy: req.user?.id || '000000000000000000000000' // Default ObjectId if no user
      });

    res.status(201).json(exam);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Failed to create exam', error: error.message });
  }
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Failed to create exam', error: error.message });
  }
};

export const getExams = async (req: Request, res: Response) => {
  try {
    const { branch } = req.params;
    const { semester, examName } = req.query;
    
    if (!branch) {
      return res.status(400).json({ message: 'Branch parameter is required' });
    }

    const decodedBranch = decodeURIComponent(branch);
    console.log('Fetching exams for branch:', decodedBranch, 'semester:', semester, 'examName:', examName);

    // Build query object
    const query: any = { branch: decodedBranch };
    
    // Add semester to query if provided
    if (semester) {
      const semesterNum = parseInt(semester as string, 10);
      if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
        return res.status(400).json({ message: 'Invalid semester value' });
      }
      query.semester = semesterNum;
    }

    // Add examName to query if provided
    if (examName) {
      query.examName = examName;
    }

    const exams = await Exam.find(query)
      .populate('allocatedTeachers', 'name email')
      .sort({ date: 1, startTime: 1 });

    console.log(`Found ${exams.length} exams for branch ${decodedBranch}${semester ? ` and semester ${semester}` : ''}${examName ? ` and exam ${examName}` : ''}`);
    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Failed to fetch exams', error: error.message });
  }
};

// Get exams by branch
export const getExamsByBranch = async (req: Request, res: Response) => {
  try {
    const { branch } = req.params;
    const { semester } = req.query;
    
    if (!branch) {
      return res.status(400).json({ message: 'Branch parameter is required' });
    }

    const query: any = { branch };
    if (semester) {
      const semesterNum = parseInt(semester as string, 10);
      if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
        return res.status(400).json({ message: 'Invalid semester value' });
      }
      query.semester = semesterNum;
    }

    const exams = await Exam.find(query)
      .populate('allocatedTeachers', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.json(exams);
  } catch (error) {
    console.error('Get exams by branch error:', error);
    res.status(500).json({ message: 'Failed to fetch exams for branch' });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }



    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('allocatedTeachers', 'name email');

    res.json(updatedExam);
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Failed to update exam' });
  }
};

export const updateExamBlock = async (req: Request, res: Response) => {
  try {
    const { id, blockNumber } = req.params;
    const blockData = req.body;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Initialize blocks array if it doesn't exist
    if (!exam.blocks) {
      exam.blocks = [];
    }

    // Validate block data
    if (blockData.capacity && typeof blockData.capacity !== 'number') {
      return res.status(400).json({ message: 'Capacity must be a number' });
    }

    // Find or create the block
    let blockIndex = exam.blocks.findIndex(b => b.number === parseInt(blockNumber));
    if (blockIndex === -1) {
      exam.blocks.push({
        number: parseInt(blockNumber),
        capacity: blockData.capacity || 0,
        location: blockData.location || '',
        invigilator: null,
    
      });
      blockIndex = exam.blocks.length - 1;
    }

    // Update block data
    Object.assign(exam.blocks[blockIndex], blockData);

    const updatedExam = await exam.save();
    res.json(updatedExam);
  } catch (error) {
    console.error('Update exam block error:', error);
    res.status(500).json({ message: 'Failed to update exam block' });
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    await Exam.findByIdAndDelete(id);
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Failed to delete exam' });
  }
};

export const getExamById = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('allocatedTeachers', 'name email');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Get exam by id error:', error);
    res.status(500).json({ message: 'Failed to fetch exam details' });
  }
};

export const assignInvigilator = async (req: Request, res: Response) => {
  try {
    const { id, blockNumber } = req.params;
    const { invigilatorId } = req.body;

    if (!invigilatorId) {
      return res.status(400).json({ message: 'Invigilator ID is required' });
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Initialize blocks array if it doesn't exist
    if (!exam.blocks) {
      exam.blocks = [];
    }

    // Find or create the block
    let block = exam.blocks.find(b => b.number === parseInt(blockNumber));
    if (!block) {
      block = {
        number: parseInt(blockNumber),
        invigilator: invigilatorId,
        capacity: 0, // Default capacity
        location: '', // Default empty location
    
      };
      exam.blocks.push(block);
    } else {
      block.invigilator = invigilatorId;
    }

    await exam.save();
    res.json(exam);
  } catch (error) {
    console.error('Assign invigilator error:', error);
    res.status(500).json({ message: 'Failed to assign invigilator' });
  }
};

export const completeBlock = async (req: Request, res: Response) => {
  try {
    const { id, blockNumber } = req.params;
    
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const block = exam.blocks?.find(b => b.number === parseInt(blockNumber));
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }


    block.completedAt = new Date();
    const updatedExam = await exam.save();

    res.json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const allocateTeachers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherIds } = req.body;
    
    const exam = await Exam.findById(id)
      .populate('allocatedTeachers', 'name email');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Get previous allocations to determine which teachers are newly allocated
    const previousTeachers = exam.allocatedTeachers.map(teacher => teacher._id.toString());
    const newTeachers = teacherIds.filter(id => !previousTeachers.includes(id));

    // Update allocated teachers
    exam.allocatedTeachers = teacherIds;
    const updatedExam = await exam.save();

    // Create notifications and send emails for newly allocated teachers
    for (const teacherId of newTeachers) {
      const teacher = await User.findById(teacherId);
      if (!teacher) continue;

      // Find the block assigned to this teacher
      const assignedBlock = exam.blocks.find(block => 
        block.invigilator?.toString() === teacherId
      );

      // Create a detailed notification message
      const notificationMessage = `
        You have been allocated to invigilate the following exam:
        Subject: ${exam.subject}
        Date: ${new Date(exam.date).toLocaleDateString()}
        Time: ${exam.startTime} - ${exam.endTime}
        Block: ${assignedBlock?.number || 'TBD'}
        Location: ${assignedBlock?.location || 'TBD'}
        Capacity: ${assignedBlock?.capacity || 'TBD'} students
      `.trim();

      // Create notification
      const notification = await Notification.create({
        teacherId: teacher._id,
        examId: exam._id,
        title: 'New Exam Invigilation Assignment',
        message: notificationMessage,
        type: 'exam_allocation'
      });

      // Send email notification
      try {
        await sendExamAllocationEmail(
          teacher.email,
          teacher.name,
          exam,
          assignedBlock?.number
        );
      } catch (emailError) {
        console.error(`Failed to send email to ${teacher.email}:`, emailError);
        // Continue with other notifications even if email fails
      }
    }

    // Return exam with populated teacher details and exam details
    const populatedExam = await Exam.findById(updatedExam._id)
      .populate('allocatedTeachers', 'name email');

    res.json({
      _id: populatedExam._id,
      examName: exam.examName,
      subject: exam.subject,
      semester: exam.semester,
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      allocatedTeachers: populatedExam.allocatedTeachers
    });
  } catch (error) {
    console.error('Allocate teachers error:', error);
    res.status(500).json({ message: 'Failed to allocate teachers' });
  }
};

export const addBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { number, capacity, location } = req.body;

    if (!number || !capacity || !location) {
      return res.status(400).json({ message: 'Block number, capacity, and location are required' });
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Initialize blocks array if it doesn't exist
    if (!exam.blocks) {
      exam.blocks = [];
    }

    // Check if block number already exists
    if (exam.blocks.some(block => block.number === number)) {
      return res.status(400).json({ message: 'Block number already exists for this exam' });
    }

    // Add new block
    exam.blocks.push({
      number,
      capacity,
      location,
      invigilator: undefined
    });

    const updatedExam = await exam.save();
    const populatedExam = await Exam.findById(updatedExam._id)
      .populate('allocatedTeachers', 'name email');
    res.status(201).json(populatedExam);
  } catch (error) {
    console.error('Add block error:', error);
    res.status(500).json({ message: 'Failed to add block to exam' });
  }
};

export const deleteBlock = async (req: Request, res: Response) => {
  try {
    const { id: examId, blockNumber } = req.params;
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const blockIndex = exam.blocks?.findIndex(block => block.number === parseInt(blockNumber));
    if (blockIndex === -1 || blockIndex === undefined) {
      return res.status(404).json({ message: 'Block not found' });
    }

    exam.blocks?.splice(blockIndex, 1);
    await exam.save();
    
    const populatedExam = await Exam.findById(examId)
      .populate('allocatedTeachers', 'name email');
    res.status(200).json(populatedExam);
  } catch (error) {
    console.error('Delete block error:', error);
    res.status(500).json({ message: 'Failed to delete block', error: error.message });
  }
};


// Auto-allocate teachers to an exam
export const autoAllocateTeachers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find the exam
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Check if the exam has blocks defined
    if (!exam.blocks || exam.blocks.length === 0) {
      return res.status(400).json({ message: 'This exam has no blocks defined. Please add blocks to this exam before auto-allocating teachers.' });
    }

    // Get all active teachers with pagination
    const User = mongoose.model('User');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Get teachers with availability information
    const teachers = await User.find({ role: 'teacher', active: true })
      .select('_id name email role active availability')
      .skip(skip)
      .limit(limit);

    if (!teachers || teachers.length === 0) {
      return res.status(400).json({ message: 'No active teachers found' });
    }

    // Get exam date and day of week
    const examDate = new Date(exam.date);
    const examDayOfWeek = examDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Filter teachers by availability
    const availableTeachers = teachers.filter(teacher => 
      teacher.availability && teacher.availability.includes(examDayOfWeek)
    );

    if (availableTeachers.length === 0) {
      return res.status(400).json({ 
        message: `No teachers available on ${examDayOfWeek}`,
        examDate: exam.date,
        requiredDay: examDayOfWeek
      });
    }

    // Get all exams to calculate workload - optimize query
    const allExams = await Exam.find({})
      .select('allocatedTeachers blocks.invigilator date')
      .lean(); // Use lean() for better performance
    
    // Calculate workload for each available teacher using time-based weighting
    const teacherWorkload = new Map();
    const currentDate = new Date();
    
    // Initialize workload counter for available teachers only
    availableTeachers.forEach(teacher => {
      teacherWorkload.set(teacher._id.toString(), {
        total: 0,
        recent: 0, // Last 7 days
        sameDay: 0, // Same day as current exam
        availability: teacher.availability
      });
    });
    
    // Count existing allocations for each teacher with time-based weighting
    allExams.forEach(e => {
      const examDate = new Date(e.date);
      const daysDifference = Math.abs((examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const isRecent = daysDifference <= 7;
      const isSameDay = examDate.toDateString() === new Date(exam.date).toDateString();
      
      // Count general allocations
      if (e.allocatedTeachers?.length > 0) {
        e.allocatedTeachers.forEach(teacherId => {
          const id = teacherId.toString();
          if (teacherWorkload.has(id)) {
            const workload = teacherWorkload.get(id);
            workload.total++;
            if (isRecent) workload.recent++;
            if (isSameDay) workload.sameDay++;
            teacherWorkload.set(id, workload);
          }
        });
      }
      
      // Count block invigilator assignments
      if (e.blocks?.length > 0) {
        e.blocks.forEach(block => {
          if (block.invigilator) {
            const id = block.invigilator.toString();
            if (teacherWorkload.has(id)) {
              const workload = teacherWorkload.get(id);
              workload.total++;
              if (isRecent) workload.recent++;
              if (isSameDay) workload.sameDay++;
              teacherWorkload.set(id, workload);
            }
          }
        });
      }
    });
    
    // Calculate weighted workload scores with error handling
    const maxTotal = Math.max(...Array.from(teacherWorkload.values()).map(w => w.total), 1);
    const maxRecent = Math.max(...Array.from(teacherWorkload.values()).map(w => w.recent), 1);
    const maxSameDay = Math.max(...Array.from(teacherWorkload.values()).map(w => w.sameDay), 1);
    
    const teacherScores = availableTeachers.map(teacher => {
      try {
        const workload = teacherWorkload.get(teacher._id.toString()) || { 
          total: 0, 
          recent: 0, 
          sameDay: 0,
          availability: teacher.availability 
        };
        
        // Calculate weighted scores
        const totalScore = 5 * (1 - (workload.total / maxTotal)); // 50% weight
        const recentScore = 3 * (1 - (workload.recent / maxRecent)); // 30% weight
        const sameDayScore = 2 * (1 - (workload.sameDay / maxSameDay)); // 20% weight
        
        // Calculate final score (0-10 scale)
        const finalScore = totalScore + recentScore + sameDayScore;
        
        return {
          teacher,
          score: finalScore,
          workload,
          breakdown: {
            totalScore,
            recentScore,
            sameDayScore
          }
        };
      } catch (error) {
        console.error(`Error calculating score for teacher ${teacher._id}:`, error);
        return {
          teacher,
          score: 0,
          workload: { 
            total: 0, 
            recent: 0, 
            sameDay: 0,
            availability: teacher.availability 
          },
          breakdown: { totalScore: 0, recentScore: 0, sameDayScore: 0 }
        };
      }
    });
    
    // Sort teachers by weighted score (descending)
    const sortedTeachers = teacherScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.teacher);
    
    // Allocate teachers to the exam based on the number of blocks
    const numTeachersToAllocate = exam.blocks.length;
    
    // Select teachers with lowest weighted workload
    const selectedTeachers = sortedTeachers.slice(0, numTeachersToAllocate);
    
    // Update the exam with allocated teachers
    exam.allocatedTeachers = selectedTeachers.map(teacher => teacher._id);
    
    // Assign invigilators to blocks with error handling
    if (exam.blocks && exam.blocks.length > 0) {
      try {
        // Get remaining teachers (not already allocated to this exam)
        const remainingTeachers = sortedTeachers.filter(teacher => 
          !selectedTeachers.some(t => t._id.toString() === teacher._id.toString())
        );
        
        // Assign invigilators to blocks
        for (let i = 0; i < exam.blocks.length; i++) {
          const block = exam.blocks[i];
          
          // Skip if block already has an invigilator
          if (block.invigilator) continue;
          
          // Assign the next available teacher with lowest weighted workload
          if (i < remainingTeachers.length) {
            block.invigilator = remainingTeachers[i]._id;
            remainingTeachers.splice(i, 1);
          } else if (sortedTeachers.length > 0) {
            // If we run out of remaining teachers, use teachers from the main pool
            // but avoid assigning the same teacher to multiple blocks
            const availableTeachers = sortedTeachers.filter(teacher => 
              !exam.blocks.some(b => 
                b.invigilator && b.invigilator.toString() === teacher._id.toString()
              )
            );
            
            if (availableTeachers.length > 0) {
              block.invigilator = availableTeachers[0]._id;
            }
          }
        }
      } catch (error) {
        console.error('Error assigning invigilators to blocks:', error);
        // Continue with the process even if block assignment fails
      }
    }
    
    // Log allocation results with more details
    console.log('Auto-allocation results:', {
      examId: exam._id,
      examName: exam.examName,
      examDate: exam.date,
      examDay: examDayOfWeek,
      totalTeachers: teachers.length,
      availableTeachers: availableTeachers.length,
      allocatedTeachers: selectedTeachers.length,
      blocks: exam.blocks?.length || 0,
      assignedBlocks: exam.blocks?.filter(b => b.invigilator).length || 0,
      workloadDistribution: Array.from(teacherWorkload.entries()).map(([id, workload]) => ({
        teacherId: id,
        totalWorkload: workload.total,
        recentWorkload: workload.recent,
        sameDayWorkload: workload.sameDay,
        availability: workload.availability
      }))
    });
    
    // Save the updated exam with error handling
    try {
      await exam.save();
    } catch (error) {
      console.error('Error saving exam:', error);
      return res.status(500).json({ message: 'Failed to save exam allocation' });
    }
    
    // Return the updated exam with populated teacher details
    const updatedExam = await Exam.findById(id)
      .populate('allocatedTeachers', 'name email')
      .lean(); // Use lean() for better performance
    
    res.json({
      exam: updatedExam,
      allocationStats: {
        examDate: exam.date,
        examDay: examDayOfWeek,
        totalTeachers: teachers.length,
        availableTeachers: availableTeachers.length,
        allocatedTeachers: selectedTeachers.length,
        blocks: exam.blocks?.length || 0,
        assignedBlocks: exam.blocks?.filter(b => b.invigilator).length || 0,
        workloadDistribution: Array.from(teacherWorkload.entries()).map(([id, workload]) => ({
          teacherId: id,
          totalWorkload: workload.total,
          recentWorkload: workload.recent,
          sameDayWorkload: workload.sameDay,
          availability: workload.availability
        }))
      }
    });
  } catch (error) {
    console.error('Auto-allocate teachers error:', error);
    res.status(500).json({ 
      message: 'Failed to auto-allocate teachers', 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export default {
  createExam,
  getExams,
  getExamsByBranch,
  updateExam,
  deleteExam,
  getExamById,
  assignInvigilator,
  completeBlock,
  allocateTeachers,
  addBlock,
  deleteBlock
};