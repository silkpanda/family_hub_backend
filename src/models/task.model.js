const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  taskName: {
    type: String,
    required: true,
    trim: true,
  },
  listId: {
    type: Schema.Types.ObjectId,
    ref: 'List',
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
  },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;