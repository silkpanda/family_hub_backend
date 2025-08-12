// Defines the Mongoose schema for a Recipe.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const recipeSchema = new Schema({
  name: { type: String, required: [true, 'Recipe name is required.'], trim: true },
  description: { type: String, trim: true },
  ingredients: [{ type: String, trim: true }],
  instructions: { type: String, required: [true, 'Instructions are required.'] },
  prepTime: { type: Number }, // in minutes
  cookTime: { type: Number }, // in minutes
  sourceUrl: { type: String, trim: true },
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;