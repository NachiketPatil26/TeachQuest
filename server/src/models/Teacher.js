const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  availability: [{
    date: Date,
    timeSlots: [String],
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  duties: [{
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending'
    },
    acceptedAt: Date,
    completedAt: Date,
    remuneration: {
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
      },
      paidAt: Date
    }
  }],
  totalDuties: {
    type: Number,
    default: 0
  },
  totalRemuneration: {
    type: Number,
    default: 0
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

// Hash password before saving
teacherSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
teacherSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update availability
teacherSchema.methods.updateAvailability = async function(date, timeSlots, isAvailable) {
  const existingSlot = this.availability.find(slot => 
    slot.date.toDateString() === new Date(date).toDateString()
  );

  if (existingSlot) {
    existingSlot.timeSlots = timeSlots;
    existingSlot.isAvailable = isAvailable;
  } else {
    this.availability.push({ date, timeSlots, isAvailable });
  }

  return this.save();
};

// Method to update duty status and remuneration
teacherSchema.methods.updateDutyStatus = async function(dutyId, status, amount = 0) {
  const duty = this.duties.id(dutyId);
  if (!duty) throw new Error('Duty not found');

  duty.status = status;
  if (status === 'accepted') duty.acceptedAt = new Date();
  if (status === 'completed') {
    duty.completedAt = new Date();
    duty.remuneration.amount = amount;
    this.totalDuties += 1;
    this.totalRemuneration += amount;
  }

  return this.save();
};

module.exports = mongoose.model('Teacher', teacherSchema);