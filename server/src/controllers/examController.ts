import { Request, Response } from 'express';
import mongoose from 'mongoose';
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

    // Get all teachers
    const User = mongoose.model('User');
    const teachers = await User.find({ role: 'teacher', active: true });
    if (!teachers || teachers.length === 0) {
      return res.status(400).json({ message: 'No active teachers found' });
    }

    // Get all exams to check for conflicts
    const allExams = await Exam.find({
      date: exam.date,
      _id: { $ne: exam._id } // Exclude current exam
    });

    // Filter teachers by availability (day of week)
    const examDate = new Date(exam.date);
    const weekday = examDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get teachers who are available on this day
    const availableTeachers = teachers.filter(teacher => 
      teacher.availability && teacher.availability.includes(weekday)
    );

    if (availableTeachers.length === 0) {
      return res.status(400).json({ message: 'No teachers available on this day' });
    }

    // Filter out teachers with time conflicts
    const teachersWithoutConflicts = availableTeachers.filter(teacher => {
      return !allExams.some(otherExam => {
        // Check if teacher is allocated to this exam
        const isAllocated = otherExam.allocatedTeachers.some(t => t.toString() === teacher._id.toString());
        
        // Check if teacher is an invigilator in any block
        const isInvigilator = otherExam.blocks?.some(block => 
          block.invigilator && block.invigilator.toString() === teacher._id.toString()
        );
        
        if (!isAllocated && !isInvigilator) return false;
        
        // Check time overlap
        const otherStart = otherExam.startTime;
        const otherEnd = otherExam.endTime;
        const examStart = exam.startTime;
        const examEnd = exam.endTime;
        
        // Time overlap check: not (end1 <= start2 or end2 <= start1)
        return !(otherEnd <= examStart || examEnd <= otherStart);
      });
    });

    // Constraint relaxation strategy - if no teachers without conflicts, allow some conflicts
    // but only if they don't overlap completely with the current exam
    if (teachersWithoutConflicts.length === 0) {
      console.log('No teachers without conflicts, relaxing constraints...');
      const teachersWithPartialConflicts = availableTeachers.filter(teacher => {
        return !allExams.some(otherExam => {
          // Check if teacher is allocated to this exam
          const isAllocated = otherExam.allocatedTeachers.some(t => t.toString() === teacher._id.toString());
          
          // Check if teacher is an invigilator in any block
          const isInvigilator = otherExam.blocks?.some(block => 
            block.invigilator && block.invigilator.toString() === teacher._id.toString()
          );
          
          if (!isAllocated && !isInvigilator) return false;
          
          // Check for complete time overlap (stricter check)
          const otherStart = otherExam.startTime;
          const otherEnd = otherExam.endTime;
          const examStart = exam.startTime;
          const examEnd = exam.endTime;
          
          // Complete overlap check: exam is completely contained within other exam
          return examStart >= otherStart && examEnd <= otherEnd;
        });
      });
      
      if (teachersWithPartialConflicts.length > 0) {
        console.log(`Found ${teachersWithPartialConflicts.length} teachers with partial conflicts after relaxing constraints`);
        teachersWithoutConflicts.push(...teachersWithPartialConflicts);
      } else {
        return res.status(400).json({ message: 'All available teachers have complete time conflicts' });
      }
    }

    // Calculate weighted scores for each teacher based on multiple factors
    const teacherScores = teachersWithoutConflicts.map(teacher => {
      let score = 0;
      
      // 1. Subject expertise score (0-5 points)
      // Check if teacher has expertise in this subject
      if (teacher.subjectExpertise && teacher.subjectExpertise.length > 0) {
        const expertiseEntry = teacher.subjectExpertise.find(entry => 
          entry.subject.toLowerCase() === exam.subject.toLowerCase() ||
          exam.subject.toLowerCase().includes(entry.subject.toLowerCase()) ||
          entry.subject.toLowerCase().includes(exam.subject.toLowerCase())
        );
        
        if (expertiseEntry) {
          // Add expertise level (1-5) to score
          score += expertiseEntry.level;
        } else {
          // Check if teacher teaches this subject (fallback to old method)
          const teachesSubject = teacher.subjects?.some(subject => 
            subject.toLowerCase() === exam.subject.toLowerCase() ||
            exam.subject.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(exam.subject.toLowerCase())
          );
          
          if (teachesSubject) {
            score += 3; // Default medium expertise if they teach the subject but no expertise level set
          }
        }
      } else {
        // Fallback to old method if no expertise data
        const teachesSubject = teacher.subjects?.some(subject => 
          subject.toLowerCase() === exam.subject.toLowerCase() ||
          exam.subject.toLowerCase().includes(subject.toLowerCase()) ||
          subject.toLowerCase().includes(exam.subject.toLowerCase())
        );
        
        if (teachesSubject) {
          score += 3; // Default medium expertise
        }
      }
      
      // 2. Subject preference score (0-5 points)
      if (teacher.subjectPreferences && teacher.subjectPreferences.length > 0) {
        const preferenceEntry = teacher.subjectPreferences.find(entry => 
          entry.subject.toLowerCase() === exam.subject.toLowerCase() ||
          exam.subject.toLowerCase().includes(entry.subject.toLowerCase()) ||
          entry.subject.toLowerCase().includes(exam.subject.toLowerCase())
        );
        
        if (preferenceEntry) {
          score += preferenceEntry.preference;
        }
      }
      
      // 3. Time preference score (0-5 points)
      if (teacher.timePreferences && teacher.timePreferences.length > 0) {
        // Create a time slot string in format "HH:MM-HH:MM"
        const examTimeSlot = `${exam.startTime}-${exam.endTime}`;
        
        const timePreferenceEntry = teacher.timePreferences.find(entry => 
          entry.slot === examTimeSlot ||
          entry.slot.includes(exam.startTime) ||
          entry.slot.includes(exam.endTime)
        );
        
        if (timePreferenceEntry) {
          score += timePreferenceEntry.preference;
        }
      }
      
      return {
        teacher,
        score
      };
    });
    
    // Sort teachers by score (descending)
    const sortedTeachers = teacherScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.teacher);
    
    // Get teacher workload (number of allocations) - enhanced to consider historical allocations
    const teacherWorkload = new Map();
    
    // Initialize workload counter for all teachers
    teacherScores.forEach(item => {
      teacherWorkload.set(item.teacher._id.toString(), 0);
    });
    
    // Count existing allocations for each teacher (including historical data)
    // This now considers all exams, not just current ones
    const allExamsWithAllocations = await Exam.find({});
    allExamsWithAllocations.forEach(e => {
      // Count general allocations
      if (e.allocatedTeachers && e.allocatedTeachers.length > 0) {
        e.allocatedTeachers.forEach(teacherId => {
          const id = teacherId.toString();
          if (teacherWorkload.has(id)) {
            teacherWorkload.set(id, teacherWorkload.get(id) + 1);
          }
        });
      }
      
      // Count block invigilator assignments
      if (e.blocks && e.blocks.length > 0) {
        e.blocks.forEach(block => {
          if (block.invigilator) {
            const id = block.invigilator.toString();
            if (teacherWorkload.has(id)) {
              teacherWorkload.set(id, teacherWorkload.get(id) + 1);
            }
          }
        });
      }
    });
    
    // Update teacher scores with workload factor (inverse relationship - lower workload = higher score)
    const maxWorkload = Math.max(...Array.from(teacherWorkload.values()), 1); // Avoid division by zero
    
    // Update scores with workload factor and geographic proximity
    const teacherScoresWithWorkload = teacherScores.map(item => {
      const workload = teacherWorkload.get(item.teacher._id.toString()) || 0;
      
      // Workload score: 0-5 points (inverse relationship - lower workload = higher score)
      // Teachers with lower workload get higher scores
      const workloadScore = 5 * (1 - (workload / maxWorkload));
      
      // Geographic proximity score (0-5 points)
      // If the exam has blocks with locations, calculate proximity score
      let proximityScore = 0;
      if (exam.blocks && exam.blocks.length > 0 && exam.blocks.some(b => b.location)) {
        // Check if teacher has other exams on the same day
        const teacherExamsOnSameDay = allExamsWithAllocations.filter(e => {
          const examDate = new Date(e.date);
          const currentExamDate = new Date(exam.date);
          
          // Check if dates are the same
          if (examDate.getFullYear() !== currentExamDate.getFullYear() ||
              examDate.getMonth() !== currentExamDate.getMonth() ||
              examDate.getDate() !== currentExamDate.getDate()) {
            return false;
          }
          
          // Check if teacher is allocated to this exam
          return e.allocatedTeachers.some(t => t.toString() === item.teacher._id.toString()) ||
                 e.blocks?.some(block => block.invigilator && 
                   block.invigilator.toString() === item.teacher._id.toString());
        });
        
        if (teacherExamsOnSameDay.length > 0) {
          // If teacher has other exams on the same day, prioritize proximity
          // Simple implementation: if locations match, give higher score
          const examLocations = exam.blocks
            .filter(b => b.location)
            .map(b => b.location.toLowerCase());
          
          const otherExamLocations = teacherExamsOnSameDay
            .flatMap(e => e.blocks || [])
            .filter(b => b.location)
            .map(b => b.location.toLowerCase());
          
          // Check for location matches
          const locationMatches = examLocations.filter(loc => 
            otherExamLocations.some(otherLoc => 
              otherLoc === loc || otherLoc.includes(loc) || loc.includes(otherLoc)
            )
          ).length;
          
          // Calculate proximity score based on location matches
          proximityScore = locationMatches > 0 ? 5 : 0;
        } else {
          // If no other exams on same day, proximity doesn't matter
          proximityScore = 3; // Neutral score
        }
      }
      
      // Calculate final score with all factors
      // Subject expertise and preference: 0-10 points (from previous calculation)
      // Workload: 0-5 points
      // Proximity: 0-5 points
      const finalScore = item.score + workloadScore + proximityScore;
      
      return {
        teacher: item.teacher,
        score: finalScore,
        factors: {
          subjectScore: item.score,
          workloadScore,
          proximityScore
        }
      };
    });
    
    // Sort teachers by final score (descending)
    const sortedByScore = teacherScoresWithWorkload
      .sort((a, b) => b.score - a.score)
      .map(item => item.teacher);
    
    // Allocate teachers to the exam based on the number of blocks
    let numTeachersToAllocate = 0;
    
    // If the exam has blocks, allocate one teacher per block
    if (exam.blocks && exam.blocks.length > 0) {
      numTeachersToAllocate = exam.blocks.length;
    } else {
      // If no blocks, allocate 2-3 teachers based on subject importance
      numTeachersToAllocate = Math.min(3, sortedByScore.length);
    }
    
    // Select teachers based on the optimized scoring system
    const selectedTeachers = sortedByScore.slice(0, numTeachersToAllocate);
    
    // Update the exam with allocated teachers
    exam.allocatedTeachers = selectedTeachers.map(teacher => teacher._id);
    
    // If the exam has blocks, assign invigilators to each block
    if (exam.blocks && exam.blocks.length > 0) {
      // Get teachers not already allocated to this exam for block assignments
      const remainingTeachers = sortedByScore.filter(teacher => 
        !selectedTeachers.some(t => t._id.toString() === teacher._id.toString())
      );
      
      // Assign invigilators to blocks based on location proximity and expertise
      for (let i = 0; i < exam.blocks.length; i++) {
        const block = exam.blocks[i];
        
        // Skip if block already has an invigilator
        if (block.invigilator) continue;
        
        // If we have remaining teachers, assign based on location and expertise
        if (remainingTeachers.length > 0) {
          // If block has a location, try to find teachers with proximity to this location
          if (block.location) {
            // Find teachers who have expertise in the subject and are close to this location
            const teachersWithProximity = remainingTeachers.filter(teacher => {
              // Check if teacher has other exams on the same day with the same location
              const hasNearbyExam = allExamsWithAllocations.some(e => {
                // Check if dates match
                const examDate = new Date(e.date);
                const currentExamDate = new Date(exam.date);
                if (examDate.getFullYear() !== currentExamDate.getFullYear() ||
                    examDate.getMonth() !== currentExamDate.getMonth() ||
                    examDate.getDate() !== currentExamDate.getDate()) {
                  return false;
                }
                
                // Check if teacher is allocated to this exam
                const isAllocated = e.allocatedTeachers.some(t => 
                  t.toString() === teacher._id.toString()
                );
                
                // Check if teacher is an invigilator in any block with matching location
                const isInvigilatorWithLocation = e.blocks?.some(b => 
                  b.invigilator && 
                  b.invigilator.toString() === teacher._id.toString() &&
                  b.location && (
                    b.location.toLowerCase() === block.location.toLowerCase() ||
                    b.location.toLowerCase().includes(block.location.toLowerCase()) ||
                    block.location.toLowerCase().includes(b.location.toLowerCase())
                  )
                );
                
                return isAllocated || isInvigilatorWithLocation;
              });
              
              return hasNearbyExam;
            });
            
            // If we found teachers with proximity, use them first
            if (teachersWithProximity.length > 0) {
              block.invigilator = teachersWithProximity[0]._id;
              // Remove this teacher from the remaining pool
              const index = remainingTeachers.findIndex(t => 
                t._id.toString() === teachersWithProximity[0]._id.toString()
              );
              if (index !== -1) {
                remainingTeachers.splice(index, 1);
              }
              continue;
            }
          }
          // If no teachers with proximity, use the next available teacher based on score
          if (i < remainingTeachers.length) {
            block.invigilator = remainingTeachers[i]._id;
            // Remove this teacher from the remaining pool
            remainingTeachers.splice(i, 1);
          } else if (sortedByScore.length > 0) {
            // If we run out of remaining teachers, use teachers from the main pool
            // but avoid assigning the same teacher to multiple blocks
            const availableTeachers = sortedByScore.filter(teacher => 
              !exam.blocks.some(b => 
                b.invigilator && b.invigilator.toString() === teacher._id.toString()
              )
            );
            
            if (availableTeachers.length > 0) {
              block.invigilator = availableTeachers[0]._id;
            }
          }
        }
      }
    }
    
    // Log allocation results for debugging
    console.log(`Auto-allocated ${selectedTeachers.length} teachers to exam ${exam._id}`);
    if (exam.blocks && exam.blocks.length > 0) {
      const assignedBlocks = exam.blocks.filter(b => b.invigilator).length;
      console.log(`Assigned invigilators to ${assignedBlocks}/${exam.blocks.length} blocks`);
    }
    
    // Save the updated exam
    await exam.save();
    
    // Return the updated exam with populated teacher details
    const updatedExam = await Exam.findById(id)
      .populate('allocatedTeachers', 'name email');
    
    res.json(updatedExam);
  } catch (error) {
    console.error('Auto-allocate teachers error:', error);
    res.status(500).json({ message: 'Failed to auto-allocate teachers', error: error.message });
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