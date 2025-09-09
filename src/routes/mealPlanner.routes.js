const express = require('express');
const mealPlannerController = require('../controllers/mealPlanner.controller');
const router = express.Router({ mergeParams: true });

// --- Diagnostic Logging ---
console.log('[ mealPlanner.routes.js ] - File loaded and router created.');
console.log('[ mealPlanner.routes.js ] - Imported controller:', mealPlannerController);


// === RECIPES ===
router.post('/recipes', (req, res, next) => {
    console.log(`[ mealPlanner.routes.js ] - POST /recipes route matched. Passing to controller.`);
    next();
}, mealPlannerController.addRecipe);

router.get('/recipes', mealPlannerController.getRecipes);
router.put('/recipes/:recipeId', mealPlannerController.updateRecipe);
router.delete('/recipes/:recipeId', mealPlannerController.deleteRecipe);

// === RESTAURANTS ===
router.post('/restaurants', mealPlannerController.addRestaurant);
router.get('/restaurants', mealPlannerController.getRestaurants);
router.put('/restaurants/:restaurantId', mealPlannerController.updateRestaurant);
router.delete('/restaurants/:restaurantId', mealPlannerController.deleteRestaurant);

// === MEAL PLAN ===
router.get('/plan', mealPlannerController.getMealPlan);
router.put('/plan', mealPlannerController.updateMealPlan);

module.exports = router;

