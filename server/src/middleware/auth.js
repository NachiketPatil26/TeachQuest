const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.userId);
    } else if (decoded.role === 'teacher') {
      user = await Teacher.findById(decoded.userId);
    }

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    req.token = token;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;
module.exports.JWT_SECRET = JWT_SECRET;