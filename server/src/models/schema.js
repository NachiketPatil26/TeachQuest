const mongoose = require('mongoose');

// Branch Schema
const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }]
});

// Subject Schema
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  semester: { type: Number, required: true },
  credits: { type: Number, required: true }
});

// Exam Schema
const examSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  totalStudents: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  }
});

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  specialization: [String],
  isAvailable: { type: Boolean, default: true },
  phone: { type: String },
  duties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Duty' }]
});

// Duty Schema
const dutySchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  role: { 
    type: String, 
    enum: ['supervisor', 'invigilator', 'reliever'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['assigned', 'accepted', 'rejected', 'completed'],
    default: 'assigned'
  },
  remuneration: {
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'processed', 'paid'],
      default: 'pending'
    },
    paidDate: { type: Date }
  }
}, { timestamps: true });

// Create models
const Branch = mongoose.model('Branch', branchSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Exam = mongoose.model('Exam', examSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Duty = mongoose.model('Duty', dutySchema);

module.exports = {
  Branch,
  Subject,
  Exam,
  Teacher,
  Duty
};