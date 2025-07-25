import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    // Recipe Controllers
    getAllRecipes,
    createRecipe,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    addIngredientsToList,

    // Meal Plan Controllers
    getMealPlan,
    addRecipeToPlan,
    removeRecipeFromPlan,

} from '../controllers/meal.controller.js'; // Assuming meal.controller.js will be created
import {
    recipeValidationRules,
    mealPlanValidationRules,
    handleValidationErrors
} from '../validators/meal.validator.js'; // Assuming meal.validator.js will be created

const router = express.Router();

// Protect all routes in this file
router.use(protect);

// --- Recipe Box Routes ---

// @desc    Get all recipes for the family
// @route   GET /api/meals/recipes
router.get('/recipes', getAllRecipes);

// @desc    Create a new recipe
// @route   POST /api/meals/recipes
router.post('/recipes', recipeValidationRules(), handleValidationErrors, createRecipe);

// @desc    Get a single recipe by its ID
// @route   GET /api/meals/recipes/:id
router.get('/recipes/:id', getRecipeById);

// @desc    Update a recipe
// @route   PUT /api/meals/recipes/:id
router.put('/recipes/:id', recipeValidationRules(), handleValidationErrors, updateRecipe);

// @desc    Delete a recipe
// @route   DELETE /api/meals/recipes/:id
router.delete('/recipes/:id', deleteRecipe);


// --- Meal Plan Routes ---

// @desc    Get the family's meal plan
// @route   GET /api/meals/plan
router.get('/plan', getMealPlan);

// @desc    Add a recipe to a specific date in the meal plan
// @route   POST /api/meals/plan
router.post('/plan', mealPlanValidationRules(), handleValidationErrors, addRecipeToPlan);

// @desc    Remove a recipe from a specific date in the meal plan
// @route   DELETE /api/meals/plan
router.delete('/plan', removeRecipeFromPlan); // Date and recipeId will be in the body


// --- Integration Route ---

// @desc    Add all ingredients from a recipe to a specific shopping list
// @route   POST /api/meals/recipes/:id/add-to-list
router.post('/recipes/:recipeId/add-to-list', addIngredientsToList);


export default router;
