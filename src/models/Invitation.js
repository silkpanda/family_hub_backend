// FILE: /src/models/Invitation.js
const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
    inviter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
    inviteCode: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: '1m' } } // Auto-delete after 1 minute for this example
}, { timestamps: true });

module.exports = mongoose.model('Invitation', InvitationSchema);