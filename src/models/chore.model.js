import mongoose from 'mongoose';
const { Schema } = mongoose;

const choreSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Chore title is required.'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  // The user who created the chore (e.g., a parent)
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user the chore is assigned to (e.g., a child)
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  dueDate: {
    type: Date,
  },
  // For the rewards system
  points: {
    type: Number,
    default: 0,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  completedAt: {
    type: Date,
  },
  // For recurring chores (future implementation)
  // recurring: {
  //   type: String,
  //   enum: ['daily', 'weekly', 'monthly', null],
  //   default: null,
  // }
}, {
  timestamps: true,
});

const Chore = mongoose.model('Chore', choreSchema);

export default Chore;
