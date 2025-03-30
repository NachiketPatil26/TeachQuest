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
      .populate('blocks.invigilator', 'name email')
      .sort({ date: 1, startTime: 1 });

    // Add allocated teachers count and allocation status to each exam
    const examsWithCount = exams.map(exam => {
      // Count teachers allocated to blocks
      const blockInvigilators = exam.blocks.filter(block => block.invigilator).length;
      // Count teachers allocated directly to the exam
      const directAllocations = exam.allocatedTeachers?.length || 0;
      // Total count is the sum of both
      const totalAllocatedTeachers = blockInvigilators + directAllocations;
      
      return {
        ...exam.toObject(),
        allocatedTeachersCount: totalAllocatedTeachers,
        hasAllocations: totalAllocatedTeachers > 0
      };
    });

    console.log(`Found ${exams.length} exams for branch ${decodedBranch}${semester ? ` and semester ${semester}` : ''}${examName ? ` and exam ${examName}` : ''}`);
    res.json(examsWithCount);
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

    // Create notifications for newly allocated teachers
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
      await Notification.create({
        teacherId: teacher._id,
        examId: exam._id,
        title: 'New Exam Invigilation Assignment',
        message: notificationMessage,
        type: 'exam_allocation'
      });
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
    const exam = await Exam.findById(id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    if (!exam.blocks || exam.blocks.length === 0) {
      return res.status(400).json({ message: 'No blocks allocated to this exam' });
    }

    // Get all teachers and exams in parallel with optimized queries
    const [teachers, sameDayExams] = await Promise.all([
      User.find({ role: 'teacher' }).select('_id name email'),
      Exam.find({
        date: exam.date,
        _id: { $ne: exam._id }
      })
      .select('blocks.invigilator blocks.number startTime endTime')
      .populate('blocks.invigilator', 'name email')
    ]);

    // Pre-calculate teacher workload and block assignments
    const teacherWorkload = new Map<string, number>();
    const teacherBlockAssignments = new Map<string, Set<string>>();
    const blockAllocations = new Map<string, mongoose.Types.ObjectId>();
    const teacherTimeSlots = new Map<string, Set<string>>();
    const timeSlotTeachers = new Map<string, Set<string>>();

    // Initialize workload map and time slots
    teachers.forEach(teacher => {
      teacherWorkload.set(teacher._id.toString(), 0);
      teacherTimeSlots.set(teacher._id.toString(), new Set());
    });

    // Process same day exams once
    sameDayExams.forEach(sameDayExam => {
      const timeSlot = `${sameDayExam.startTime}-${sameDayExam.endTime}`;
      
      // Track teachers assigned to each time slot
      if (!timeSlotTeachers.has(timeSlot)) {
        timeSlotTeachers.set(timeSlot, new Set());
      }

      sameDayExam.blocks.forEach(block => {
        if (block.invigilator) {
          const teacherId = block.invigilator._id.toString();
          const blockNumber = block.number.toString();
          
          blockAllocations.set(blockNumber, block.invigilator._id);
          timeSlotTeachers.get(timeSlot)?.add(teacherId);
          
          if (!teacherBlockAssignments.has(teacherId)) {
            teacherBlockAssignments.set(teacherId, new Set());
          }
          teacherBlockAssignments.get(teacherId)?.add(blockNumber);
          teacherTimeSlots.get(teacherId)?.add(timeSlot);
        }
      });
    });

    // Allocate teachers to blocks with optimized checks
    const unallocatedBlocks = exam.blocks.filter(block => !block.invigilator);
    const currentTimeSlot = `${exam.startTime}-${exam.endTime}`;
    
    // Get teachers who were assigned in the previous time slot
    const previousSlotTeachers = timeSlotTeachers.get(currentTimeSlot) || new Set();
    
    // Create a list of available teachers for shuffling
    const availableTeachersForShuffle = teachers.filter(teacher => {
      const teacherId = teacher._id.toString();
      const teacherSlots = teacherTimeSlots.get(teacherId) || new Set();
      return !teacherSlots.has(currentTimeSlot);
    });

    // Shuffle the available teachers
    const shuffledTeachers = [...availableTeachersForShuffle].sort(() => Math.random() - 0.5);
    
    for (const block of unallocatedBlocks) {
      const blockNumber = block.number.toString();
      
      if (blockAllocations.has(blockNumber)) {
        block.invigilator = blockAllocations.get(blockNumber);
        continue;
      }

      // Find available teachers with optimized filtering
      const availableTeachers = shuffledTeachers.filter(teacher => {
        const teacherId = teacher._id.toString();
        const teacherBlocks = teacherBlockAssignments.get(teacherId) || new Set();
        
        // Check if teacher is already assigned to another block in this exam
        return !exam.blocks.some(b => b.invigilator?.toString() === teacherId);
      });

      if (availableTeachers.length === 0) {
        return res.status(400).json({ 
          message: `No available teachers for block ${blockNumber}` 
        });
      }

      // Select teacher with lowest workload from shuffled list
      const selectedTeacher = availableTeachers.reduce((min, current) => {
        const minWorkload = teacherWorkload.get(min._id.toString()) || 0;
        const currentWorkload = teacherWorkload.get(current._id.toString()) || 0;
        return currentWorkload < minWorkload ? current : min;
      });

      block.invigilator = selectedTeacher._id;
      
      // Update tracking maps
      const teacherId = selectedTeacher._id.toString();
      if (!teacherBlockAssignments.has(teacherId)) {
        teacherBlockAssignments.set(teacherId, new Set());
      }
      teacherBlockAssignments.get(teacherId)?.add(blockNumber);
      teacherTimeSlots.get(teacherId)?.add(currentTimeSlot);
      
      const currentWorkload = teacherWorkload.get(teacherId) || 0;
      teacherWorkload.set(teacherId, currentWorkload + 1);
    }

    // Quick workload rebalancing with time slot consideration
    const workloads = Array.from(teacherWorkload.entries());
    const maxWorkload = Math.max(...workloads.map(([_, w]) => w));
    const minWorkload = Math.min(...workloads.map(([_, w]) => w));

    if (maxWorkload - minWorkload > 1) {
      const maxTeacher = workloads.find(([_, w]) => w === maxWorkload)?.[0];
      const minTeacher = workloads.find(([_, w]) => w === minWorkload)?.[0];

      if (maxTeacher && minTeacher) {
        const maxBlock = exam.blocks.find(b => b.invigilator?.toString() === maxTeacher);
        const minBlock = exam.blocks.find(b => b.invigilator?.toString() === minTeacher);

        if (maxBlock && minBlock) {
          // Check if swapping would create time slot conflicts
          const maxTeacherSlots = teacherTimeSlots.get(maxTeacher) || new Set();
          const minTeacherSlots = teacherTimeSlots.get(minTeacher) || new Set();
          
          // Only swap if it won't create conflicts
          if (!maxTeacherSlots.has(currentTimeSlot) && !minTeacherSlots.has(currentTimeSlot)) {
            [maxBlock.invigilator, minBlock.invigilator] = [minBlock.invigilator, maxBlock.invigilator];
            teacherWorkload.set(maxTeacher, maxWorkload - 1);
            teacherWorkload.set(minTeacher, minWorkload + 1);
          }
        }
      }
    }

    await exam.save();

    // Create notifications in batch
    const notificationData = [];
    for (const block of exam.blocks) {
      if (block.invigilator) {
        const teacher = teachers.find(t => t._id.toString() === block.invigilator.toString());
        if (teacher) {
          notificationData.push({
            teacherId: teacher._id,
      examId: exam._id,
            title: 'New Exam Invigilation Assignment',
            message: `You have been allocated to invigilate Block ${block.number} for ${exam.subject} on ${new Date(exam.date).toLocaleDateString()} from ${exam.startTime} to ${exam.endTime}.`,
            type: 'exam_allocation'
          });
        }
      }
    }

    // Create all notifications at once
    await Notification.insertMany(notificationData);

    const updatedExam = await Exam.findById(id)
      .populate('blocks.invigilator', 'name email');
    
    res.json({
      exam: updatedExam,
      workloadStats: Array.from(teacherWorkload.entries()).map(([teacherId, workload]) => ({
        teacherName: teachers.find(t => t._id.toString() === teacherId)?.name,
        totalWorkload: workload,
        timeSlots: teacherTimeSlots.get(teacherId)?.size || 0,
        isAllocated: exam.blocks.some(block => block.invigilator?.toString() === teacherId)
      })),
      workloadBalance: {
        maxWorkload,
        minWorkload,
        difference: maxWorkload - minWorkload
      }
    });
  } catch (error) {
    console.error('Auto allocation error:', error);
    res.status(500).json({ message: 'Failed to auto-allocate teachers' });
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