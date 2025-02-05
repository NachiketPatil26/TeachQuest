const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Branch = require('../models/Branch');

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const branches = await Branch.find();
    const subjects = branches.reduce((acc, branch) => {
      return acc.concat(branch.subjects);
    }, []);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get subjects by branch
router.get('/branch/:branchId', auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json(branch.subjects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;