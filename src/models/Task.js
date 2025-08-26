// FILE: /src/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
    title: { type: String, required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    points: { type: Number, default: 0 },
    type: { type: String, enum: ['routine', 'chore', 'quest'], required: true },
    status: { type: String, enum: ['incomplete', 'pending_approval', 'complete'], default: 'incomplete' },
    timeOfDay: { type: String, enum: ['morning', 'afternoon', 'evening', 'any'] },
    isRepeatable: { type: Boolean, default: false },
    repeatFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);