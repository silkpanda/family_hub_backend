import Recipe from '../../models/recipe.model.js';
import MealPlan from '../../models/mealPlan.model.js';
import List from '../../models/list.model.js';
import { io } from '../../app.js';

// Helper function to get and MANUALLY populate the meal plan, bypassing Mongoose's map limitation.
const getAndManuallyPopulateMealPlan = async (familyId) => {
    // 1. Fetch the raw meal plan as a plain JavaScript object
    const mealPlan = await MealPlan.findOne({ familyId }).lean();
    
    // --- FIX ---
    // Check if the plan exists and is a non-empty object
    if (!mealPlan || !mealPlan.plan || Object.keys(mealPlan.plan).length === 0) {
        return mealPlan; // Return as is if no plan exists or it's empty
    }

    // 2. Collect all unique recipe IDs from the entire plan
    const recipeIds = new Set();
    // Use Object.values() because .lean() converts the Map to a plain object
    for (const day of Object.values(mealPlan.plan)) {
        for (const meal of day) {
            recipeIds.add(meal.recipeId.toString());
        }
    }

    if (recipeIds.size === 0) {
        return mealPlan; // No recipes to populate
    }

    // 3. Fetch all required recipe details in a single efficient query
    const recipes = await Recipe.find({ '_id': { $in: Array.from(recipeIds) } }).select('name').lean();
    const recipeMap = new Map(recipes.map(r => [r._id.toString(), r]));

    // 4. Go through the plan and replace the recipeId strings with the full recipe objects
    // Use Object.values() again to iterate over the plain object
    for (const day of Object.values(mealPlan.plan)) {
        for (let i = 0; i < day.length; i++) {
            const meal = day[i];
            const recipeDetails = recipeMap.get(meal.recipeId.toString());
            if (recipeDetails) {
                // Replace the ID with the populated recipe object
                meal.recipeId = recipeDetails;
            }
        }
    }

    return mealPlan;
};


// --- Recipe Box Controllers (No changes needed here) ---

export const getAllRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ familyId: req.user.familyId });
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const createRecipe = async (req, res, next) => {
  try {
    const { name, description, ingredients, instructions, prepTime, cookTime, sourceUrl } = req.body;
    const newRecipe = await Recipe.create({
      name,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      sourceUrl,
      familyId: req.user.familyId,
      createdBy: req.user.id,
    });
    res.status(201).json(newRecipe);
  } catch (error) {
    next(error);
  }
};

export const getRecipeById = async (req, res, next) => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!recipe) {
            res.status(404);
            throw new Error('Recipe not found');
        }
        res.status(200).json(recipe);
    } catch (error) {
        next(error);
    }
};

export const updateRecipe = async (req, res, next) => {
  try {
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, familyId: req.user.familyId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecipe) {
      res.status(404);
      throw new Error('Recipe not found');
    }
    res.status(200).json(updatedRecipe);
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
    if (!recipe) {
      res.status(404);
      throw new Error('Recipe not found');
    }
    await MealPlan.updateMany(
        { familyId: req.user.familyId },
        { $pull: { 'plan.$[].meals': { recipeId: recipe._id } } }
    );
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};


// --- Meal Plan Controllers (Updated) ---

export const getMealPlan = async (req, res, next) => {
  try {
    let mealPlan = await getAndManuallyPopulateMealPlan(req.user.familyId);
    if (!mealPlan) {
        const newPlan = await MealPlan.create({ familyId: req.user.familyId, plan: {} });
        return res.status(200).json(newPlan);
    }
    res.status(200).json(mealPlan);
  } catch (error) {
    next(error);
  }
};

export const addRecipeToPlan = async (req, res, next) => {
    try {
        const { recipeId, date, mealType } = req.body;
        let mealPlan = await MealPlan.findOne({ familyId: req.user.familyId });
        if (!mealPlan) {
            mealPlan = await MealPlan.create({ familyId: req.user.familyId, plan: {} });
        }

        const dateKey = new Date(date).toISOString().split('T')[0];
        const newEntry = { recipeId, mealType };

        if (mealPlan.plan.has(dateKey)) {
            mealPlan.plan.get(dateKey).push(newEntry);
        } else {
            mealPlan.plan.set(dateKey, [newEntry]);
        }

        await mealPlan.save();
        
        const populatedPlan = await getAndManuallyPopulateMealPlan(req.user.familyId);

        io.to(req.user.familyId.toString()).emit('mealplan:updated', populatedPlan);
        res.status(200).json(populatedPlan);
    } catch (error) {
        next(error);
    }
};

export const removeRecipeFromPlan = async (req, res, next) => {
    try {
        const { recipeId, date, mealType } = req.body;
        const mealPlan = await MealPlan.findOne({ familyId: req.user.familyId });
        if (!mealPlan) {
            res.status(404);
            throw new Error('Meal plan not found');
        }

        const dateKey = new Date(date).toISOString().split('T')[0];

        if (mealPlan.plan.has(dateKey)) {
            const dayPlan = mealPlan.plan.get(dateKey);
            const filteredPlan = dayPlan.filter(entry => !(entry.recipeId.toString() === recipeId && entry.mealType === mealType));
            mealPlan.plan.set(dateKey, filteredPlan);
            await mealPlan.save();
        }
        
        const populatedPlan = await getAndManuallyPopulateMealPlan(req.user.familyId);

        io.to(req.user.familyId.toString()).emit('mealplan:updated', populatedPlan);
        res.status(200).json(populatedPlan);
    } catch (error) {
        next(error);
    }
};


// --- Integration Controller (No changes needed here) ---

export const addIngredientsToList = async (req, res, next) => {
    try {
        const { recipeId } = req.params;
        const { listId } = req.body;

        const recipe = await Recipe.findOne({ _id: recipeId, familyId: req.user.familyId });
        if (!recipe) {
            res.status(404);
            throw new Error('Recipe not found');
        }

        const list = await List.findOne({ _id: listId, familyId: req.user.familyId });
        if (!list) {
            res.status(404);
            throw new Error('Shopping list not found');
        }

        const newItems = recipe.ingredients.map(ingredient => ({
            content: ingredient,
            createdBy: req.user.id,
        }));

        list.items.push(...newItems);
        await list.save();

        const updatedList = await List.findById(listId);
        io.to(req.user.familyId.toString()).emit('list:updated', updatedList);

        res.status(200).json({ message: `${recipe.ingredients.length} ingredients added to ${list.name}` });
    } catch (error) {
        next(error);
    }
};
