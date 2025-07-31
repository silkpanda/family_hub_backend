// ===================================================================================
// File: /backend/src/api/validators/list.validator.js
// ===================================================================================
import { body, validationResult } from 'express-validator';
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};
export const listValidationRules = () => [
  body('name').trim().not().isEmpty().withMessage('List name is required.'),
];
export const itemValidationRules = () => [
  body('content').trim().not().isEmpty().withMessage('Item content is required.'),
];


