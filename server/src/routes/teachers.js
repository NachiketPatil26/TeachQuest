const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Teacher = require('../models/Teacher');

// Get all teachers
router.get('/', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const teachers = await Teacher.find().select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get teacher profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const teacher = await Teacher.findById(req.user._id).select('-password');
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update teacher availability
router.patch('/availability', auth, async (req, res) => {
  try {
    if (req.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { date, timeSlots, isAvailable } = req.body;
    const teacher = await Teacher.findById(req.user._id);
    await teacher.updateAvailability(date, timeSlots, isAvailable);
    res.json(teacher.availability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;