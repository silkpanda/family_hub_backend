import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for creating/updating a list
export const listValidationRules = () => {
  return [
    body('name').trim().not().isEmpty().withMessage('List name is required.'),
  ];
};

// Validation rules for creating/updating a list item
export const itemValidationRules = () => {
  return [
    body('content').trim().not().isEmpty().withMessage('Item content is required.'),
  ];
};

export { handleValidationErrors };
