const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    displayName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    image: { type: String },
    households: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Household' }],
    role: { type: String, enum: ['parent', 'child'], default: 'child' },
    pin: { type: String },
    pinIsSet: { type: Boolean, default: false },
    isPlaceholder: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    // NEW FIELD: To store the ID of the linked Google Calendar
    googleCalendarId: { type: String, default: null },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (this.isModified('pin')) {
        this.pin = await bcrypt.hash(this.pin, 10);
    }
    next();
});

UserSchema.methods.matchPin = async function(enteredPin) {
    return await bcrypt.compare(enteredPin, this.pin);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
