import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { 
    getChores, 
    createChore, 
    updateChore, 
    deleteChore,
    toggleChoreCompletion
} from '../controllers/chore.controller.js'; // Assuming chore.controller.js exists
import { 
    choreValidationRules, 
    handleValidationErrors 
} from '../validators/chore.validator.js'; // Assuming chore.validator.js exists

const router = express.Router();

// All routes in this file are protected and require a user to be logged in.
router.use(protect);

// --- Standard CRUD Routes ---

// @desc    Get all chores for the user's family
// @route   GET /api/chores
router.get('/', getChores);

// @desc    Create a new chore
// @route   POST /api/chores
router.post('/', choreValidationRules(), handleValidationErrors, createChore);

// @desc    Update a chore by its ID
// @route   PUT /api/chores/:id
router.put('/:id', choreValidationRules(), handleValidationErrors, updateChore);

// @desc    Delete a chore by its ID
// @route   DELETE /api/chores/:id
router.delete('/:id', deleteChore);


// --- Feature-Specific Route ---

// @desc    Mark a chore as complete or incomplete
// @route   PATCH /api/chores/:id/toggle
// Using PATCH is suitable here as we are only modifying a single field (isComplete).
router.patch('/:id/toggle', toggleChoreCompletion);


export default router;
