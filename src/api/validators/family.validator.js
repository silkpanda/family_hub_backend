import { body, validationResult } from 'express-validator';

// This is a list of Google Calendar's default event colors.
// Restricting colors to this list ensures uniformity across platforms.
const GOOGLE_CALENDAR_COLORS = [
    '#039be5', // Blue
    '#7986cb', // Lavender
    '#33b679', // Sage
    '#8e24aa', // Grape
    '#e67c73', // Flamingo
    '#f6c026', // Banana
    '#f5511d', // Tangerine
    '#009688', // Peacock
    '#616161', // Graphite
    '#b39ddb', // Basil
    '#f4511e', // Tomato
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation for creating a new family
export const createFamilyValidation = () => [
    body('familyName').trim().not().isEmpty().withMessage('Family name is required.'),
    body('userColor').isIn(GOOGLE_CALENDAR_COLORS).withMessage('A valid color is required.'),
];

// Validation for adding a new family member
export const addMemberValidation = () => [
    body('name').trim().not().isEmpty().withMessage('Member name is required.'),
    body('color').isIn(GOOGLE_CALENDAR_COLORS).withMessage('A valid color is required.'),
    body('role').isIn(['Parent/Guardian', 'Child']).withMessage('A valid role is required.'),
    body('email').optional().isEmail().withMessage('A valid email is required if provided.'),
];

// Validation for updating a family member
export const updateMemberValidation = () => [
    body('color').optional().isIn(GOOGLE_CALENDAR_COLORS).withMessage('A valid color is required.'),
    body('role').optional().isIn(['Parent/Guardian', 'Child']).withMessage('A valid role is required.'),
];

// Validation for joining a family
export const joinFamilyValidation = () => [
    body('inviteCode').trim().not().isEmpty().withMessage('Invite code is required.'),
    body('userColor').isIn(GOOGLE_CALENDAR_COLORS).withMessage('A valid color is required.'),
];
