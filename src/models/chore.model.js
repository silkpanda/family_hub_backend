// ===================================================================================
// File: /backend/src/models/chore.model.js
// Purpose: Defines the Mongoose schema for the Chore collection.
//
// --- Dev Notes (UPDATE) ---
// - Added the `routineCategory` field. This is an enum that can only be 'Morning',
//   'Day', or 'Night'. It is not required, as it only applies to routines (chores
//   with 0 points).
// ===================================================================================
import mongoose from 'mongoose';

const { Schema } = mongoose;

const choreSchema = new Schema({
  title: { type: String, required: [true, 'Chore title is required.'], trim: true },
  description: { type: String, trim: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  points: { type: Number, default: 0, min: [0, 'Points cannot be negative.'] },
  isComplete: { type: Boolean, default: false },
  dueDate: { type: Date },
  routineCategory: { type: String, enum: ['Morning', 'Day', 'Night'] }, // --- NEW ---
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Chore = mongoose.model('Chore', choreSchema);

export default Chore;
