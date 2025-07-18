const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    userId: { // Link to the user who owns/created this event
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    googleEventId: { // Google Calendar's event ID for syncing
        type: String,
        unique: true,
        sparse: true, // Allows null values, important if an event isn't synced yet
    },
    summary: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    start: {
        dateTime: {
            type: Date,
            required: true,
        },
        timeZone: {
            type: String,
            default: 'UTC', // You might want to adjust this or make it dynamic
        },
    },
    end: {
        dateTime: {
            type: Date,
            required: true,
        },
        timeZone: {
            type: String,
            default: 'UTC',
        },
    },
    // Add other relevant Google Calendar event properties as needed
    // e.g., location, attendees, recurrence rules, etc.
    // For now, keeping it simple.
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Event', EventSchema);