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

    // Update allocated teachers
    exam.allocatedTeachers = teacherIds;
    const updatedExam = await exam.save();

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
