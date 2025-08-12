// Defines the API routes for managing recipes and the meal plan.

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getAllRecipes, createRecipe, getRecipeById, updateRecipe, deleteRecipe, addIngredientsToList, getMealPlan, addRecipeToPlan, removeRecipeFromPlan } from '../controllers/meal.controller.js';
import { recipeValidationRules, mealPlanValidationRules, handleValidationErrors } from '../validators/meal.validator.js';

const mealRouter = express.Router();
mealRouter.use(protect); // All meal routes are protected.

// Routes for recipe management.
mealRouter.get('/recipes', getAllRecipes);
mealRouter.post('/recipes', recipeValidationRules(), handleValidationErrors, createRecipe);
mealRouter.get('/recipes/:id', getRecipeById);
mealRouter.put('/recipes/:id', recipeValidationRules(), handleValidationErrors, updateRecipe);
mealRouter.delete('/recipes/:id', deleteRecipe);
mealRouter.post('/recipes/:recipeId/add-to-list', addIngredientsToList);

// Routes for meal plan management.
mealRouter.get('/plan', getMealPlan);
mealRouter.post('/plan', mealPlanValidationRules(), handleValidationErrors, addRecipeToPlan);
mealRouter.delete('/plan', removeRecipeFromPlan);

export default mealRouter;