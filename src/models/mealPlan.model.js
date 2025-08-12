// Defines the Mongoose schema for the weekly Meal Plan.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const mealPlanEntrySchema = new Schema({
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    mealType: { type: String, required: true, trim: true }, // e.g., 'Breakfast', 'Lunch', 'Dinner'
}, { _id: false });

const mealPlanSchema = new Schema({
    familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, unique: true, index: true },
    // A Map is used to store meal entries, with the date string (YYYY-MM-DD) as the key.
    plan: { type: Map, of: [mealPlanEntrySchema], default: {} },
}, { timestamps: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;