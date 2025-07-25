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
} from '../controllers/family.controller.js'; // This controller will be created next
import {
    createFamilyValidation,
    addMemberValidation,
    updateMemberValidation,
    joinFamilyValidation,
    handleValidationErrors
} from '../validators/family.validator.js'; // This validator will be created next

const router = express.Router();

// All routes in this file are protected and require a user to be logged in.
router.use(protect);

// @desc    Create a new family (part of the onboarding process)
// @route   POST /api/family
router.post('/', createFamilyValidation(), handleValidationErrors, createFamily);

// @desc    Get details of the current user's family
// @route   GET /api/family
router.get('/', getFamilyDetails);

// @desc    Get all members of the current user's family
// @route   GET /api/family/members
router.get('/members', getFamilyMembers);

// @desc    Add a new member to the family
// @route   POST /api/family/members
router.post('/members', addMemberValidation(), handleValidationErrors, addFamilyMember);

// @desc    Update an existing family member's details (e.g., color, role)
// @route   PUT /api/family/members/:memberId
router.put('/members/:memberId', updateMemberValidation(), handleValidationErrors, updateFamilyMember);

// @desc    Remove a member from the family
// @route   DELETE /api/family/members/:memberId
router.delete('/members/:memberId', removeFamilyMember);

// @desc    Join an existing family using an invite code
// @route   POST /api/family/join
router.post('/join', joinFamilyValidation(), handleValidationErrors, joinFamily);


export default router;
