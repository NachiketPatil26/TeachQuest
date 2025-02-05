const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exam = require('../models/Exam');
const Teacher = require('../models/Teacher');

// Get all exams (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const exams = await Exam.find().populate('branch subject');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get upcoming exams
router.get('/upcoming', auth, async (req, res) => {
  try {
    const exams = await Exam.findUpcoming().populate('branch subject');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new exam (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    console.log('Backend: Received exam creation request:', req.body);

    const exam = new Exam(req.body);
    console.log('Backend: Created exam instance:', exam);

    await exam.save();
    console.log('Backend: Exam saved successfully:', exam);

    res.status(201).json(exam);
  } catch (error) {
    console.error('Backend: Error creating exam:', error);
    res.status(400).json({ error: error.message });
  }
});

// Assign teacher to exam duty (admin only)
router.post('/:examId/duties', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { teacherId } = req.body;
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    await exam.assignTeacher(teacherId);
    
    // Also update teacher's duties
    const teacher = await Teacher.findById(teacherId);
    teacher.duties.push({
      exam: exam._id,
      status: 'pending'
    });
    await teacher.save();
    
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update duty status
router.patch('/:examId/duties/:dutyId', auth, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    const duty = exam.duties.id(req.params.dutyId);
    if (!duty) {
      return res.status(404).json({ error: 'Duty not found' });
    }
    
    // Only allow teachers to update their own duties
    if (req.role === 'teacher' && duty.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await exam.updateDutyStatus(req.params.dutyId, status, remarks);
    
    // Also update teacher's duty status
    const teacher = await Teacher.findById(duty.teacher);
    const teacherDuty = teacher.duties.find(d => d.exam.toString() === exam._id.toString());
    if (teacherDuty) {
      await teacher.updateDutyStatus(teacherDuty._id, status);
    }
    
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;