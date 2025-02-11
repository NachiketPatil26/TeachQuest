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

export const createExam = async (req: ExamRequest, res: Response) => {
  try {
    const { branch, subject, date, startTime, endTime } = req.body;
    
    if (!branch || !subject || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exam = await Exam.create({
      branch,
      subject,
      date,
      startTime,
      endTime,
      createdBy: req.user?.id
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Failed to create exam' });
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

    const exams = await Exam.find({ branch: { $regex: new RegExp('^' + decodedBranch + '$', 'i') } })
      .populate('allocatedTeachers', 'name email')
      .sort({ date: 1, startTime: 1 });

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: `No exams found for branch: ${decodedBranch}` });
    }

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