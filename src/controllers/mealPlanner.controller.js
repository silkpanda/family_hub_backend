const Household = require('../models/Household');

// Helper function to get the Socket.IO instance from the request
const getSocketIo = (req) => req.app.get('socketio');

// --- RECIPE CONTROLLERS ---
const addRecipe = async (req, res) => {
    const { householdId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        household.recipes.push(req.body);
        await household.save();
        
        const newRecipe = household.recipes[household.recipes.length - 1];
        io.to(householdId).emit('recipe_created', newRecipe);
        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(400).json({ message: 'Error adding recipe', error: error.message });
    }
};

const getRecipes = async (req, res) => {
    try {
        const { householdId } = req.params;
        const household = await Household.findById(householdId).select('recipes');
        if (!household) return res.status(404).json({ message: 'Household not found' });
        res.status(200).json(household.recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching recipes' });
    }
};

const updateRecipe = async (req, res) => {
    const { householdId, recipeId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const recipe = household.recipes.id(recipeId);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        recipe.set(req.body);
        await household.save();
        
        io.to(householdId).emit('recipe_updated', recipe);
        res.status(200).json(recipe);
    } catch (error) {
        res.status(400).json({ message: 'Error updating recipe' });
    }
};

const deleteRecipe = async (req, res) => {
    const { householdId, recipeId } = req.params;
    const io = getSocketIo(req);
    try {
        await Household.updateOne(
            { _id: householdId },
            { $pull: { recipes: { _id: recipeId } } }
        );
        io.to(householdId).emit('recipe_deleted', recipeId);
        res.status(200).json({ message: 'Recipe deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting recipe' });
    }
};


// --- RESTAURANT CONTROLLERS ---
const addRestaurant = async (req, res) => {
    const { householdId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        household.restaurants.push(req.body);
        await household.save();
        
        const newRestaurant = household.restaurants[household.restaurants.length - 1];
        io.to(householdId).emit('restaurant_created', newRestaurant);
        res.status(201).json(newRestaurant);
    } catch (error) {
        res.status(400).json({ message: 'Error adding restaurant', error: error.message });
    }
};

const getRestaurants = async (req, res) => {
    try {
        const { householdId } = req.params;
        const household = await Household.findById(householdId).select('restaurants');
        if (!household) return res.status(404).json({ message: 'Household not found' });
        res.status(200).json(household.restaurants);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching restaurants' });
    }
};

const updateRestaurant = async (req, res) => {
    const { householdId, restaurantId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const restaurant = household.restaurants.id(restaurantId);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        restaurant.set(req.body);
        await household.save();
        
        io.to(householdId).emit('restaurant_updated', restaurant);
        res.status(200).json(restaurant);
    } catch (error) {
        res.status(400).json({ message: 'Error updating restaurant' });
    }
};

const deleteRestaurant = async (req, res) => {
    const { householdId, restaurantId } = req.params;
    const io = getSocketIo(req);
    try {
        await Household.updateOne(
            { _id: householdId },
            { $pull: { restaurants: { _id: restaurantId } } }
        );
        io.to(householdId).emit('restaurant_deleted', restaurantId);
        res.status(200).json({ message: 'Restaurant deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting restaurant' });
    }
};


// --- MEAL PLAN CONTROLLERS ---
const getMealPlan = async (req, res) => {
     try {
        const { householdId } = req.params;
        const household = await Household.findById(householdId).select('mealPlan');
        if (!household) return res.status(404).json({ message: 'Household not found' });
        res.status(200).json(household.mealPlan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error getting meal plan' });
    }
};
const updateMealPlan = async (req, res) => {
    const { householdId } = req.params;
    const { plan } = req.body;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        // Mongoose Maps require you to set the entire map.
        household.mealPlan.plan = plan;
        await household.save();

        io.to(householdId).emit('mealplan_updated', household.mealPlan);
        res.status(200).json(household.mealPlan);
    } catch (error) {
        res.status(400).json({ message: 'Error updating meal plan', error: error.message });
    }
};


module.exports = {
    addRecipe,
    getRecipes,
    updateRecipe,
    deleteRecipe,
    addRestaurant,
    getRestaurants,
    updateRestaurant,
    deleteRestaurant,
    getMealPlan,
    updateMealPlan,
};

