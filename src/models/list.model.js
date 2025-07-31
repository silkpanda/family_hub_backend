// ===================================================================================
// File: /backend/src/models/list.model.js
// Purpose: Defines the Mongoose schema for the List collection.
//
// --- Dev Notes (UPDATE) ---
// - The `assignedTo` field has been MOVED from the `listItemSchema` to the `listSchema`.
// - It is now an array of ObjectIds, allowing a list to be assigned to multiple users.
// - The `assignedTo` field on individual items has been REMOVED.
// ===================================================================================
import mongoose from 'mongoose';

const { Schema } = mongoose;

const listItemSchema = new Schema({
  content: { type: String, required: [true, 'List item content is required.'], trim: true },
  isComplete: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const listSchema = new Schema({
  name: { type: String, required: [true, 'List name is required.'], trim: true },
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
  items: [listItemSchema],
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }], // --- MOVED & UPDATED ---
}, { timestamps: true });

const List = mongoose.model('List', listSchema);

export default List;
