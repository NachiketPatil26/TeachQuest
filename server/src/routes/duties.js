const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const Exam = require('../models/Exam');

// Get teacher's duties
router.get('/my-duties', auth, async (req, res) => {
  try {
    if (req.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const teacher = await Teacher.findById(req.user._id).populate('duties.exam');
    res.json(teacher.duties);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update duty status
router.patch('/:dutyId', auth, async (req, res) => {
  try {
    if (req.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { status } = req.body;
    const teacher = await Teacher.findById(req.user._id);
    await teacher.updateDutyStatus(req.params.dutyId, status);
    res.json(teacher.duties.id(req.params.dutyId));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;