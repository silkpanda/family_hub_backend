import { body, validationResult } from 'express-validator';

// Middleware to check for and handle validation errors.
// This should be placed after the rules in the route chain.
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are errors, return a 400 Bad Request response with the errors.
    return res.status(400).json({ errors: errors.array() });
  }
  // If validation passes, proceed to the next middleware (the controller).
  next();
};

// Defines the set of validation rules for creating or updating a chore.
const choreValidationRules = () => {
  return [
    // Title must not be empty.
    body('title')
      .trim()
      .not().isEmpty()
      .withMessage('Chore title is required.'),

    // Description is optional, but if provided, it will be trimmed.
    body('description')
      .optional()
      .trim(),

    // Points must be a non-negative integer.
    body('points')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Points must be a positive number.'),

    // Due date, if provided, must be a valid ISO 8601 date string.
    body('dueDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Invalid due date format.'),
      
    // assignedTo, if provided, must be a valid MongoDB ObjectId.
    body('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('Invalid user ID format for assignment.'),
  ];
};

export { choreValidationRules, handleValidationErrors };
