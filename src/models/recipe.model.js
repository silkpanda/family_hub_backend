import mongoose from 'mongoose';
const { Schema } = mongoose;

const recipeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Recipe name is required.'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // Storing ingredients as an array of strings for simplicity.
  // Each string can be one ingredient, e.g., "1 cup flour".
  ingredients: [{
    type: String,
    trim: true,
  }],
  instructions: {
    type: String,
    required: [true, 'Instructions are required.'],
  },
  prepTime: { // in minutes
    type: Number, 
  },
  cookTime: { // in minutes
    type: Number,
  },
  sourceUrl: { // For recipes imported from the web
    type: String,
    trim: true,
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
