// ===================================================================================
// File: /backend/src/models/event.model.js
// ===================================================================================
import mongoose from 'mongoose';
const { Schema } = mongoose;


const eventSchema = new Schema({
  title: { type: String, required: [true, 'Event title is required.'], trim: true },
  description: { type: String, trim: true },
  startTime: { type: Date, required: [true, 'Start time is required.'] },
  endTime: { type: Date, required: [true, 'End time is required.'] },
  isAllDay: { type: Boolean, default: false },
  color: { type: String, default: '#3174ad' },
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  externalCalendarId: { type: String, sparse: true },
}, { timestamps: true });


eventSchema.index({ familyId: 1, startTime: 1 });
const Event = mongoose.model('Event', eventSchema);
export default Event;
