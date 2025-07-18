const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
    },
    accessToken: { // Store the Google access token (short-lived)
        type: String,
    },
    refreshToken: { // Store the Google refresh token (long-lived, used to get new access tokens)
        type: String,
    },
    googleCalendarId: { // The primary calendar ID for this user on Google Calendar
        type: String,
        default: 'primary' // Default to primary calendar
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);