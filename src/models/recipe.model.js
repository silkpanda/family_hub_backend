// ===================================================================================
// File: /backend/src/models/recipe.model.js
// ===================================================================================
import mongoose from 'mongoose';
const { Schema } = mongoose;


const recipeSchema = new Schema({
  name: { type: String, required: [true, 'Recipe name is required.'], trim: true },
  description: { type: String, trim: true },
  ingredients: [{ type: String, trim: true }],
  instructions: { type: String, required: [true, 'Instructions are required.'] },
  prepTime: { type: Number },
  cookTime: { type: Number },
  sourceUrl: { type: String, trim: true },
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });


const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;


