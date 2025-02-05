const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subjects: [subjectSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
branchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to add a subject
branchSchema.methods.addSubject = async function(subjectData) {
  if (!this.subjects) {
    this.subjects = [];
  }
  this.subjects.push(subjectData);
  return this.save();
};

// Static method to find branch by code
branchSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase() });
};

module.exports = mongoose.model('Branch', branchSchema);