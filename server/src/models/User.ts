import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher';
  phone?: string;
  branch?: string;
  department?: string;
  subjects?: string[];
  // Subject expertise levels (1-5 scale, where 5 is highest expertise)
  subjectExpertise?: { subject: string; level: number }[];
  // Subject preferences (1-5 scale, where 5 is highest preference)
  subjectPreferences?: { subject: string; preference: number }[];
  // Time slot preferences (1-5 scale, where 5 is highest preference)
  timePreferences?: { slot: string; preference: number }[];
  availability?: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
  remuneration: number;
  tokens: { token: string }[];
  active: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['admin', 'teacher'],
      required: true
    },
    phone: {
      type: String,
      trim: true
    },
    branch: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    subjects: [{
      type: String,
      trim: true
    }],
    // Subject expertise levels (1-5 scale, where 5 is highest expertise)
    subjectExpertise: [{
      subject: {
        type: String,
        trim: true
      },
      level: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      }
    }],
    // Subject preferences (1-5 scale, where 5 is highest preference)
    subjectPreferences: [{
      subject: {
        type: String,
        trim: true
      },
      preference: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      }
    }],
    // Time slot preferences (1-5 scale, where 5 is highest preference)
    timePreferences: [{
      slot: {
        type: String,
        trim: true
      },
      preference: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      }
    }],
    availability: [{
      type: String,
      trim: true
    }],
    remuneration: {
      type: Number,
      default: 0
    },
    tokens: [{
      token: {
        type: String,
        required: true
      }
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

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;