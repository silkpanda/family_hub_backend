import { body, validationResult } from 'express-validator';

const GOOGLE_CALENDAR_COLORS = [
    '#039be5', '#7986cb', '#33b679', '#8e24aa', '#e67c73',
    '#f6c026', '#f5511d', '#009688', '#616161',
    '#b39ddb', '#f4511e',
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const createFamilyValidation = () => [
    body('familyName').trim().not().isEmpty().withMessage('Family name is required.'),
    body('userColor').isIn(GOOGLE_CALENDAR_COLORS).withMessage('A valid color is required.'),
];

// --- NEW ---
// Validation for updating the family itself
export const updateFamilyValidation = () => [
    body('name').trim().not().isEmpty().withMessage('Family name is required.'),
];

export const addMemberValidation = () => [
    body('name').trim().not().isEmpty().withMessage('Member name is required.'),
    body('color').isIn(GOOGLE_CALENDAR_COLORS).withMessage('A valid color is required.'),
    body('role').isIn(['Parent/Guardian', 'Child']).withMessage('A valid role is required.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('A valid email is required if provided.'),
];

export const updateMemberValidation = () => [
    body('name').optional().trim().not().isEmpty().withMessage('Name cannot be empty.'),
    body('color').optional().isIn(GOOGLE_CALENDAR_COLORS).withMessage('A valid color is required.'),
    body('role').optional().isIn(['Parent/Guardian', 'Child']).withMessage('A valid role is required.'),
];

export const joinFamilyValidation = () => [
    body('inviteCode').trim().not().isEmpty().withMessage('Invite code is required.'),
    body('userColor').isIn(GOOGLE_CALENDAR_COLORS).withMessage('A valid color is required.'),
];
