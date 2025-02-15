import { Request, Response } from 'express';
import Exam from '../models/Exam';

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
    const { branch, subject, date, startTime, endTime } = req.body;
    
    if (!branch || !subject || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
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
        subject: subjectString,
        date,
        startTime,
        endTime,
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
    if (!branch) {
      return res.status(400).json({ message: 'Branch parameter is required' });
    }

    const decodedBranch = decodeURIComponent(branch);
    console.log('Fetching exams for branch:', decodedBranch);

    const exams = await Exam.find({ branch: decodedBranch })
      .populate('allocatedTeachers', 'name email')
      .sort({ date: 1, startTime: 1 });

    console.log(`Found ${exams.length} exams for branch ${decodedBranch}`);
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
    if (!branch) {
      return res.status(400).json({ message: 'Branch parameter is required' });
    }

    const exams = await Exam.find({ branch })
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
    const { block } = req.body;
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Validate block if provided
    if (block && !['A', 'B', 'C', 'D'].includes(block)) {
      return res.status(400).json({ message: 'Invalid block. Must be A, B, C, or D' });
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

    if (blockData.status && !['pending', 'in_progress', 'completed'].includes(blockData.status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find or create the block
    let blockIndex = exam.blocks.findIndex(b => b.number === parseInt(blockNumber));
    if (blockIndex === -1) {
      exam.blocks.push({
        number: parseInt(blockNumber),
        capacity: blockData.capacity || 0,
        location: blockData.location || '',
        status: blockData.status || 'pending',
        invigilator: blockData.invigilator || null
      });
      blockIndex = exam.blocks.length - 1;
    } else {
      // Update existing block while preserving invigilator
      exam.blocks[blockIndex] = {
        ...exam.blocks[blockIndex],
        ...blockData,
        invigilator: blockData.invigilator || exam.blocks[blockIndex].invigilator
      };
    }

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
        status: 'pending' // Default status
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

    block.status = 'completed';
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
    
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    (exam as any).allocatedTeachers = teacherIds;
    const updatedExam = await exam.save();

    res.json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
  allocateTeachers
};