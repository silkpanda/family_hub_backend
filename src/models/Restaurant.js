// FILE: /src/models/Restaurant.js
const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    household: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    details: { // For storing info like cuisine type, favorite dish, etc.
        type: String,
        trim: true
    }
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
module.exports = Restaurant;