import { body, validationResult } from 'express-validator';

// Reusable middleware to handle validation errors.
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for creating or updating a List document.
const listValidationRules = () => {
  return [
    // The name of the list (e.g., "Groceries") is required.
    body('name')
      .trim()
      .not().isEmpty()
      .withMessage('List name is required.'),

    // The type of list is optional, but if provided, it must be one of the allowed values.
    body('type')
      .optional()
      .isIn(['grocery', 'todo', 'other'])
      .withMessage('Invalid list type.'),
  ];
};

// Validation rules for adding or updating an item within a list.
const itemValidationRules = () => {
  return [
    // The text content of the item (e.g., "Milk") is required.
    body('text')
      .trim()
      .not().isEmpty()
      .withMessage('List item text cannot be empty.'),
  ];
};

export { 
  listValidationRules, 
  itemValidationRules, 
  handleValidationErrors 
};
