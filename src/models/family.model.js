// Defines the Mongoose schema for a Family, including its members.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// Sub-schema for individual family members.
const familyMemberSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Parent/Guardian', 'Child'], required: true },
    color: { type: String, required: true },
    pin: { type: String, select: false }, // 'select: false' prevents the PIN from being returned in queries by default.
});

// Mongoose pre-save hook to automatically hash the PIN before saving.
familyMemberSchema.pre('save', async function(next) {
    if (!this.isModified('pin') || !this.pin) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.pin = await bcrypt.hash(this.pin, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare an entered PIN with the hashed PIN in the database.
familyMemberSchema.methods.comparePin = async function(enteredPin) {
    if (!this.pin) return false;
    return await bcrypt.compare(enteredPin, this.pin);
};

const familySchema = new Schema({
  name: { type: String, required: [true, 'Family name is required.'], trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [familyMemberSchema],
  inviteCode: { type: String, unique: true, sparse: true },
}, { timestamps: true });

const Family = mongoose.model('Family', familySchema);
export default Family;