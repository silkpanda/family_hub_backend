import mongoose from 'mongoose';
const { Schema } = mongoose;

// This is a schema for the individual items that will go inside a list.
// It will be used as a sub-document.
const listItemSchema = new Schema({
  text: {
    type: String,
    required: [true, 'List item text is required.'],
    trim: true,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Track who completed the item, which is useful for chore lists.
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  completedAt: {
    type: Date,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt for each item
});


// This is the main schema for the list itself.
const listSchema = new Schema({
  name: {
    type: String,
    required: [true, 'List name is required.'],
    trim: true,
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true, // Index for faster querying of lists by family
  },
  // Embed the listItemSchema as an array of sub-documents.
  items: [listItemSchema],
  // You can use a type to differentiate lists for special UI treatment later.
  type: {
    type: String,
    enum: ['grocery', 'todo', 'other'],
    default: 'other',
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt for the list document
});

const List = mongoose.model('List', listSchema);

export default List;
