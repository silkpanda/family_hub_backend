// Defines the Mongoose schema for a Chore.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const choreSchema = new Schema({
  title: { type: String, required: [true, 'Chore title is required.'], trim: true },
  description: { type: String, trim: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  points: { type: Number, default: 0, min: [0, 'Points cannot be negative.'] },
  status: { 
    type: String, 
    enum: ['Incomplete', 'Pending Approval', 'Completed'], 
    default: 'Incomplete' 
  },
  dueDate: { type: Date },
  routineCategory: { type: String, enum: ['Morning', 'Day', 'Night'] }, // For non-point-based routines
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Virtual property to easily check if a chore is complete.
choreSchema.virtual('isComplete').get(function() {
  return this.status === 'Completed';
});

const Chore = mongoose.model('Chore', choreSchema);

export default Chore;