import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for creating/updating a chore
export const choreValidationRules = () => {
  return [
    body('title').trim().not().isEmpty().withMessage('Chore title is required.'),
    body('points').optional().isNumeric().withMessage('Points must be a number.'),
    body('dueDate').optional().isISO8601().toDate().withMessage('Due date must be a valid date.'),
  ];
};

export { handleValidationErrors };
