// ===================================================================================
// File: /backend/src/api/validators/meal.validator.js
// ===================================================================================
import { body, validationResult } from 'express-validator';
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};
export const recipeValidationRules = () => [
    body('name').trim().not().isEmpty().withMessage('Recipe name is required.'),
    body('instructions').trim().not().isEmpty().withMessage('Instructions are required.'),
    body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required.'),
    body('ingredients.*').trim().not().isEmpty().withMessage('Ingredient content cannot be empty.'),
    body('prepTime').optional().isNumeric().withMessage('Prep time must be a number.'),
    body('cookTime').optional().isNumeric().withMessage('Cook time must be a number.'),
];
export const mealPlanValidationRules = () => [
    body('recipeId').isMongoId().withMessage('A valid recipe ID is required.'),
    body('date').isISO8601().toDate().withMessage('A valid date in YYYY-MM-DD format is required.'),
    body('mealType').trim().not().isEmpty().withMessage('Meal type (e.g., Dinner) is required.'),
];
