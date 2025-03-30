import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  teacherId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'exam_allocation' | 'exam_update' | 'exam_cancellation';
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['exam_allocation', 'exam_update', 'exam_cancellation'],
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;