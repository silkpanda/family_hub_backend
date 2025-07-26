import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    createFamily,
    getFamilyDetails,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    joinFamily,
    getFamilyMembers,
    updateFamily, // <-- New import
} from '../controllers/family.controller.js';
import {
    createFamilyValidation,
    addMemberValidation,
    updateMemberValidation,
    joinFamilyValidation,
    updateFamilyValidation, // <-- New import
    handleValidationErrors
} from '../validators/family.validator.js';

const router = express.Router();

// All routes in this file are protected and require a user to be logged in.
router.use(protect);

// @desc    Create a new family
router.post('/', createFamilyValidation(), handleValidationErrors, createFamily);

// @desc    Get details of the current user's family
router.get('/', getFamilyDetails);

// @desc    Update the family's details (e.g., name)
// @route   PUT /api/family
router.put('/', updateFamilyValidation(), handleValidationErrors, updateFamily);

// @desc    Get all members of the current user's family
router.get('/members', getFamilyMembers);

// @desc    Add a new member to the family
router.post('/members', addMemberValidation(), handleValidationErrors, addFamilyMember);

// @desc    Update an existing family member's details (e.g., name, color, role)
// @route   PUT /api/family/members/:memberId
router.put('/members/:memberId', updateMemberValidation(), handleValidationErrors, updateFamilyMember);

// @desc    Remove a member from the family
router.delete('/members/:memberId', removeFamilyMember);

// @desc    Join an existing family using an invite code
router.post('/join', joinFamilyValidation(), handleValidationErrors, joinFamily);


export default router;
