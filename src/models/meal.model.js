import mongoose from 'mongoose';
const { Schema } = mongoose;

// A sub-document schema for ingredients.
// This structured format is crucial for the "add to grocery list" feature.
const ingredientSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: String, // e.g., "2 cups", "1 tbsp", "100g"
    required: true,
    trim: true,
  },
});

// --- Recipe Model ---
// This model represents a single recipe in the family's "Recipe Box".
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
  ingredients: [ingredientSchema],
  instructions: {
    type: String,
    required: [true, 'Instructions are required.'],
  },
  prepTimeInMinutes: {
    type: Number,
  },
  cookTimeInMinutes: {
    type: Number,
  },
  sourceUrl: { // For recipes imported from websites
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// --- Meal Plan Model ---
// This model links a recipe to a specific date and meal type (e.g., Dinner on Tuesday).
const mealPlanSchema = new Schema({
    familyId: {
        type: Schema.Types.ObjectId,
        ref: 'Family',
        required: true,
        index: true,
    },
    recipeId: {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true,
    },
    // The date the meal is planned for. Time component will be ignored.
    date: {
        type: Date,
        required: true,
    },
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        required: true,
    }
}, {
    timestamps: true,
});

// Create a compound index to ensure a family can't have the same recipe
// scheduled for the same date and meal type more than once.
mealPlanSchema.index({ familyId: 1, date: 1, mealType: 1 }, { unique: true });

const Recipe = mongoose.model('Recipe', recipeSchema);
const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export { Recipe, MealPlan };
