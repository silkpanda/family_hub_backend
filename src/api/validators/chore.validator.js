import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const choreValidationRules = () => [
  body('title').trim().not().isEmpty().withMessage('Chore title is required.'),
  body('points').optional().isNumeric().withMessage('Points must be a number.'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Due date must be a valid date.'),
];