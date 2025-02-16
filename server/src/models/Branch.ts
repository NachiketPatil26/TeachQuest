import mongoose from 'mongoose';
import type { IUser } from './User';

interface ISubject {
  name: string;
  code: string;
  semester: number;
}

interface IBranch extends mongoose.Document {
  name: string;
  subjects: ISubject[];
  teachers: mongoose.Types.ObjectId[] | IUser[];
  active: boolean;
  hasSubject(subjectCode: string): boolean;
  getActiveTeachers(): Promise<IUser[]>;
}

const branchSchema = new mongoose.Schema<IBranch>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    subjects: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      code: {
        type: String,
        required: true,
        trim: true
      },
      semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
      }
    }],
    teachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure branch name is unique (case-insensitive)
branchSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Add method to check if a subject exists
branchSchema.methods.hasSubject = function(this: IBranch, subjectCode: string): boolean {
  return this.subjects.some(subject => subject.code === subjectCode);
};

// Add method to get all active teachers
branchSchema.methods.getActiveTeachers = async function(this: IBranch): Promise<IUser[]> {
  await this.populate('teachers', '-password -tokens');
  return (this.teachers as IUser[]).filter(teacher => teacher.active);
};

const Branch = mongoose.model<IBranch>('Branch', branchSchema);

export default Branch;
export type { IBranch, ISubject };