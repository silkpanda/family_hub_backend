// Handles the business logic for recipe and meal plan management.

import Recipe from '../../models/recipe.model.js';
import MealPlan from '../../models/mealPlan.model.js';
import List from '../../models/list.model.js';
import { io } from '../../app.js';

// Helper to retrieve and populate the meal plan with recipe details.
async function getAndPopulateMealPlan(familyId) {
    const mealPlan = await MealPlan.findOne({ familyId }).populate('plan.$*.recipeId');
    if (!mealPlan) return { plan: {} }; // Return an empty plan if none exists.
    const populatedPlan = { _id: mealPlan._id, familyId: mealPlan.familyId, plan: {} };
    // Mongoose Map requires manual iteration to ensure proper population.
    for (const [date, meals] of mealPlan.plan.entries()) {
        populatedPlan.plan[date] = meals.filter(meal => meal.recipeId != null);
    }
    return populatedPlan;
}

export const addRecipeToPlan = async (req, res, next) => {
    try {
        const { recipeId, date, mealType } = req.body;
        const dateKey = new Date(date).toISOString().split('T')[0];
        let mealPlan = await MealPlan.findOne({ familyId: req.user.familyId });
        if (!mealPlan) { mealPlan = await MealPlan.create({ familyId: req.user.familyId, plan: {} }); }
        const dayMeals = mealPlan.plan.get(dateKey) || [];
        const existingMealIndex = dayMeals.findIndex(m => m.mealType === mealType);
        if (existingMealIndex > -1) {
            dayMeals[existingMealIndex].recipeId = recipeId;
        } else {
            dayMeals.push({ recipeId, mealType });
        }
        mealPlan.plan.set(dateKey, dayMeals);
        await mealPlan.save();
        const populatedPlan = await getAndPopulateMealPlan(req.user.familyId);
        io.to(req.user.familyId.toString()).emit('mealplan:updated', populatedPlan);
        res.status(200).json(populatedPlan);
    } catch (error) { next(error); }
};

export const removeRecipeFromPlan = async (req, res, next) => {
    try {
        const { date, mealType } = req.body;
        const dateKey = new Date(date).toISOString().split('T')[0];
        const mealPlan = await MealPlan.findOne({ familyId: req.user.familyId });
        if (!mealPlan || !mealPlan.plan.has(dateKey)) { return res.status(404).json({ message: 'Meal plan entry not found' }); }
        const dayMeals = mealPlan.plan.get(dateKey).filter(m => m.mealType !== mealType);
        if (dayMeals.length > 0) {
            mealPlan.plan.set(dateKey, dayMeals);
        } else {
            mealPlan.plan.delete(dateKey);
        }
        await mealPlan.save();
        const populatedPlan = await getAndPopulateMealPlan(req.user.familyId);
        io.to(req.user.familyId.toString()).emit('mealplan:updated', populatedPlan);
        res.status(200).json(populatedPlan);
    } catch (error) { next(error); }
};

export const getAllRecipes = async (req, res, next) => {
    try {
        const recipes = await Recipe.find({ familyId: req.user.familyId });
        res.status(200).json(recipes);
    } catch (error) { next(error); }
};
export const createRecipe = async (req, res, next) => {
    try {
        const newRecipe = await Recipe.create({ ...req.body, familyId: req.user.familyId, createdBy: req.user.id });
        res.status(201).json(newRecipe);
    } catch (error) { next(error); }
};
export const getRecipeById = async (req, res, next) => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
        res.status(200).json(recipe);
    } catch (error) { next(error); }
};
export const updateRecipe = async (req, res, next) => {
    try {
        const recipe = await Recipe.findOneAndUpdate({ _id: req.params.id, familyId: req.user.familyId }, req.body, { new: true });
        if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
        res.status(200).json(recipe);
    } catch (error) { next(error); }
};
export const deleteRecipe = async (req, res, next) => {
    try {
        const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
        if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
        res.status(200).json({ message: 'Recipe deleted' });
    } catch (error) { next(error); }
};
export const getMealPlan = async (req, res, next) => {
    try {
        const populatedPlan = await getAndPopulateMealPlan(req.user.familyId);
        res.status(200).json(populatedPlan);
    } catch (error) { next(error); }
};
export const addIngredientsToList = async (req, res, next) => {
    try {
        const { recipeId } = req.params;
        const { listId } = req.body;
        const recipe = await Recipe.findById(recipeId);
        const list = await List.findById(listId);
        if (!recipe || !list || list.familyId.toString() !== req.user.familyId.toString()) {
            return res.status(404).json({ message: 'Recipe or list not found' });
        }
        const newItems = recipe.ingredients.map(ing => ({ content: ing, createdBy: req.user.id }));
        list.items.push(...newItems);
        await list.save();
        res.status(200).json({ message: 'Ingredients added' });
    } catch (error) { next(error); }
};