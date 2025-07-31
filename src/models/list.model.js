// ===================================================================================
// File: /backend/src/models/list.model.js
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
}, { timestamps: true });


const List = mongoose.model('List', listSchema);
export default List;
