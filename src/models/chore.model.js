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
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // A chore doesn't have to be assigned to be on the list
  },
  // The point value for the rewards system. Can be zero if not used.
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative.'],
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  // For recurring chores
  dueDate: {
    type: Date,
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true
});

const Chore = mongoose.model('Chore', choreSchema);

export default Chore;
