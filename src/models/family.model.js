// ===================================================================================
// File: /backend/src/models/family.model.js
// ===================================================================================
import mongoose from 'mongoose';
const { Schema } = mongoose;


const familyMemberSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Parent/Guardian', 'Child'], required: true },
  color: { type: String, required: true, trim: true },
}, { _id: false });


const familySchema = new Schema({
  name: { type: String, required: [true, 'Family name is required.'], trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [familyMemberSchema],
  inviteCode: { type: String, unique: true, sparse: true },
}, { timestamps: true });


const Family = mongoose.model('Family', familySchema);
export default Family;
