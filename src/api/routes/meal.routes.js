// ===================================================================================
// File: /backend/src/api/routes/meal.routes.js
// ===================================================================================
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getAllRecipes, createRecipe, getRecipeById, updateRecipe, deleteRecipe, addIngredientsToList, getMealPlan, addRecipeToPlan, removeRecipeFromPlan } from '../controllers/meal.controller.js';
import { recipeValidationRules, mealPlanValidationRules, handleValidationErrors } from '../validators/meal.validator.js';


const mealRouter = express.Router();
mealRouter.use(protect);
mealRouter.get('/recipes', getAllRecipes);
mealRouter.post('/recipes', recipeValidationRules(), handleValidationErrors, createRecipe);
mealRouter.get('/recipes/:id', getRecipeById);
mealRouter.put('/recipes/:id', recipeValidationRules(), handleValidationErrors, updateRecipe);
mealRouter.delete('/recipes/:id', deleteRecipe);
mealRouter.get('/plan', getMealPlan);
mealRouter.post('/plan', mealPlanValidationRules(), handleValidationErrors, addRecipeToPlan);
mealRouter.delete('/plan', removeRecipeFromPlan);
mealRouter.post('/recipes/:recipeId/add-to-list', addIngredientsToList);
export default mealRouter;
