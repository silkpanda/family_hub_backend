import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for creating/updating an event
export const eventValidationRules = () => {
  return [
    body('title').trim().not().isEmpty().withMessage('Title is required.'),
    body('startTime').isISO8601().toDate().withMessage('Valid start time is required.'),
    body('endTime').isISO8601().toDate().withMessage('Valid end time is required.')
      .custom((value, { req }) => {
        if (new Date(value) < new Date(req.body.startTime)) {
          throw new Error('End time must be after start time.');
        }
        return true;
      }),
    body('isAllDay').optional().isBoolean(),
    body('assignedTo').optional().isArray()
  ];
};

export { handleValidationErrors };
