import mongoose from 'mongoose';

interface IBlock {
  number: number;
  invigilator: mongoose.Types.ObjectId;
  capacity: number;
  location: string;
  status: 'pending' | 'completed';
  completedAt?: Date;
}

export interface IExam extends mongoose.Document {
  branch: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  blocks?: IBlock[];
  allocatedTeachers: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  status: 'scheduled' | 'in-progress' | 'completed';
}

const blockSchema = new mongoose.Schema<IBlock>({
  number: {
    type: Number,
    required: true,
  },
  invigilator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    default: 0,
  },
  location: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  completedAt: {
    type: Date,
  },
});

const examSchema = new mongoose.Schema<IExam>(
  {
    branch: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    blocks: [blockSchema],
    allocatedTeachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model<IExam>('Exam', examSchema);

export default Exam;