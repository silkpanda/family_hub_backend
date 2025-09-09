// FILE: /src/models/Event.js
const mongoose = require('mongoose');

/**
 * Event Schema
 * Defines the structure for calendar events in the database.
 */
const EventSchema = new mongoose.Schema({
    household: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Household', 
        required: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    start: { 
        type: Date, 
        required: true 
    },
    end: { 
        type: Date, 
        required: true 
    },
    allDay: { 
        type: Boolean, 
        default: false 
    },
    // You could add more fields here, like 'description', 'color', etc.
}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;