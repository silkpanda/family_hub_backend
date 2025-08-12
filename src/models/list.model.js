// Defines the Mongoose schema for a shared List and its items.

import mongoose from 'mongoose';

const { Schema } = mongoose;

// Sub-schema for individual items within a list.
const listItemSchema = new Schema({
  content: { type: String, required: [true, 'List item content is required.'], trim: true },
  isComplete: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const listSchema = new Schema({
  name: { type: String, required: [true, 'List name is required.'], trim: true },
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
  items: [listItemSchema],
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const List = mongoose.model('List', listSchema);

export default List;