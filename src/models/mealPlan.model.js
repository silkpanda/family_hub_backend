// ===================================================================================
// File: /backend/src/models/mealPlan.model.js
// ===================================================================================
import mongoose from 'mongoose';
const { Schema } = mongoose;


const mealPlanEntrySchema = new Schema({
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    mealType: { type: String, required: true, trim: true },
}, { _id: false });


const mealPlanSchema = new Schema({
    familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, unique: true, index: true },
    plan: { type: Map, of: [mealPlanEntrySchema], default: {} },
}, { timestamps: true });


const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
export default MealPlan;
