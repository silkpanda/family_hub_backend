import mongoose from 'mongoose';
const { Schema } = mongoose;

// This is a subdocument schema. It will not have its own model.
// It will be embedded within the List document.
const listItemSchema = new Schema({
  content: {
    type: String,
    required: [true, 'List item content is required.'],
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
}, {
  timestamps: true
});


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
    index: true, // Index for faster lookups by family
  },
  // Embed the list items directly into the list document.
  // This is a good pattern for data that is always accessed together.
  items: [listItemSchema], 

tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }]

}, {
  timestamps: true
});

const List = mongoose.model('List', listSchema);

export default List;
