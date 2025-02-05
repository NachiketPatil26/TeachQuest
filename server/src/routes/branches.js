const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Branch = require('../models/Branch');

// Get all branches
router.get('/', auth, async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new branch (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add subject to branch (admin only)
router.post('/:branchId/subjects', auth, async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    await branch.addSubject(req.body);
    res.json(branch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;