// ===================================================================================
// File: /backend/src/api/routes/family.routes.js
// ===================================================================================
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createFamily, getFamilyDetails, addFamilyMember, updateFamilyMember, removeFamilyMember, joinFamily, getFamilyMembers, updateFamily } from '../controllers/family.controller.js';
import { createFamilyValidation, addMemberValidation, updateMemberValidation, joinFamilyValidation, updateFamilyValidation, handleValidationErrors } from '../validators/family.validator.js';


const familyRouter = express.Router();
familyRouter.use(protect);
familyRouter.post('/', createFamilyValidation(), handleValidationErrors, createFamily);
familyRouter.get('/', getFamilyDetails);
familyRouter.put('/', updateFamilyValidation(), handleValidationErrors, updateFamily);
familyRouter.get('/members', getFamilyMembers);
familyRouter.post('/members', addMemberValidation(), handleValidationErrors, addFamilyMember);
familyRouter.put('/members/:memberId', updateMemberValidation(), handleValidationErrors, updateFamilyMember);
familyRouter.delete('/members/:memberId', removeFamilyMember);
familyRouter.post('/join', joinFamilyValidation(), handleValidationErrors, joinFamily);
export default familyRouter;
