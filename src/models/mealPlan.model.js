import mongoose from 'mongoose';
const { Schema } = mongoose;

// This schema defines a single entry in the meal plan.
const mealPlanEntrySchema = new Schema({
    recipeId: {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true,
    },
    mealType: { // e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack'
        type: String,
        required: true,
        trim: true,
    }
}, { _id: false }); // No separate _id for subdocuments

const mealPlanSchema = new Schema({
    // The family this meal plan belongs to. Should be unique.
    familyId: {
        type: Schema.Types.ObjectId,
        ref: 'Family',
        required: true,
        unique: true, // Each family only has one meal plan document
        index: true,
    },
    // Using a Map to store the plan.
    // The key will be the date in 'YYYY-MM-DD' format.
    // The value will be an array of meal plan entries for that day.
    plan: {
        type: Map,
        of: [mealPlanEntrySchema],
        default: {},
    }
}, {
    timestamps: true
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;
