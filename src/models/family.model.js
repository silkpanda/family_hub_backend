import mongoose from 'mongoose';
const { Schema } = mongoose;

// This subdocument schema defines the structure for each member within the family.
const familyMemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['Parent/Guardian', 'Child'],
    required: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  }
}, { _id: false }); // No separate _id for this subdocument

const familySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Family name is required.'],
    trim: true,
  },
  // The primary user who created the family and has admin rights.
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // An array of all members in the family, including the owner.
  // This has been updated to use the new subdocument schema.
  members: [familyMemberSchema],
  // A unique, shareable code for inviting new members.
  inviteCode: {
    type: String,
    unique: true,
    sparse: true, // Allows for multiple null values, but unique if it exists
  }
}, {
  timestamps: true
});

const Family = mongoose.model('Family', familySchema);

export default Family;
