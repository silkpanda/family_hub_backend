// Defines the API routes for managing families and their members.

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createFamily, getFamilyDetails, addFamilyMember, updateFamilyMember, removeFamilyMember, joinFamily, getFamilyMembers, updateFamily, setMemberPin } from '../controllers/family.controller.js';
import { createFamilyValidation, addMemberValidation, updateMemberValidation, joinFamilyValidation, updateFamilyValidation, handleValidationErrors } from '../validators/family.validator.js';

const familyRouter = express.Router();
familyRouter.use(protect); // All family routes are protected.

// Routes for family-level operations.
familyRouter.post('/', createFamilyValidation(), handleValidationErrors, createFamily);
familyRouter.get('/', getFamilyDetails);
familyRouter.put('/', updateFamilyValidation(), handleValidationErrors, updateFamily);
familyRouter.post('/join', joinFamilyValidation(), handleValidationErrors, joinFamily);

// Routes for member-level operations.
familyRouter.get('/members', getFamilyMembers);
familyRouter.post('/members', addMemberValidation(), handleValidationErrors, addFamilyMember);
familyRouter.put('/members/:memberId', updateMemberValidation(), handleValidationErrors, updateFamilyMember);
familyRouter.delete('/members/:memberId', removeFamilyMember);
familyRouter.patch('/members/:memberId/set-pin', setMemberPin);

export default familyRouter;