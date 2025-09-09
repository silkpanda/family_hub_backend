// FILE: /src/models/MealPlan.js
const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
    household: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
        index: true
    },
    date: { // The specific day for the meal
        type: Date,
        required: true
    },
    mealType: { // 'breakfast', 'lunch', or 'dinner'
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
    },
    // A meal can be either a recipe or a restaurant, but not both.
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        default: null
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        default: null
    }
}, { timestamps: true });

// Ensure a household can only have one type of meal for a specific slot.
MealPlanSchema.index({ household: 1, date: 1, mealType: 1 }, { unique: true });

const MealPlan = mongoose.model('MealPlan', MealPlanSchema);
module.exports = MealPlan;