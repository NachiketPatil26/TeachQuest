const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 180 // Default 3 hours
  },
  venue: {
    type: String,
    required: true
  },
  block: {
    type: String,
    required: true
  },
  maxStudents: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  duties: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending'
    },
    acceptedAt: Date,
    completedAt: Date,
    remarks: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
examSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to assign teacher to exam duty
examSchema.methods.assignTeacher = async function(teacherId) {
  this.duties.push({
    teacher: teacherId,
    status: 'pending'
  });
  return this.save();
};

// Method to update duty status
examSchema.methods.updateDutyStatus = async function(dutyId, status, remarks = '') {
  const duty = this.duties.id(dutyId);
  if (!duty) throw new Error('Duty not found');
  
  duty.status = status;
  if (status === 'accepted') duty.acceptedAt = new Date();
  if (status === 'completed') duty.completedAt = new Date();
  if (remarks) duty.remarks = remarks;
  
  return this.save();
};

// Static method to find upcoming exams
examSchema.statics.findUpcoming = function() {
  return this.find({
    date: { $gte: new Date() },
    status: 'scheduled'
  }).sort('date startTime');
};

module.exports = mongoose.model('Exam', examSchema);