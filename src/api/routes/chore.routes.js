// --- File: /backend/src/api/routes/chore.routes.js ---
// Defines the API routes for chore management and the approval workflow.

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { isParentOrGuardian } from '../middleware/role.middleware.js';
import { 
    getChores, 
    createChore, 
    deleteChore, 
    submitChoreForApproval, 
    approveChore, 
    rejectChore, // **BUG FIX:** Added a comma here.
    completeChoreForChild 
} from '../controllers/chore.controller.js';
import { choreValidationRules, handleValidationErrors } from '../validators/chore.validator.js';

const choreRouter = express.Router();

// --- Authenticated Routes ---
// These routes require a user to be logged in (parent session).
choreRouter.get('/', protect, getChores);
choreRouter.post('/', protect, choreValidationRules(), handleValidationErrors, createChore);
choreRouter.delete('/:id', protect, deleteChore);
choreRouter.patch('/:id/submit', protect, submitChoreForApproval);

// --- Parent-Only Authenticated Routes ---
choreRouter.patch('/:id/approve', protect, isParentOrGuardian, approveChore);
choreRouter.patch('/:id/reject', protect, isParentOrGuardian, rejectChore);

// --- Public/Unauthenticated Route ---
// This endpoint is for children to complete chores from their public profile page.
// It does not require authentication but uses URL parameters for security.
choreRouter.patch('/public/:choreId/complete/:childId', completeChoreForChild);

export default choreRouter;
