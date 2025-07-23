import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    getLists,
    createList,
    getListById,
    updateList,
    deleteList,
    addItemToList,
    updateListItem,
    deleteListItem,
    toggleListItemCompletion
} from '../controllers/list.controller.js'; // Assuming list.controller.js exists
import {
    listValidationRules,
    itemValidationRules,
    handleValidationErrors
} from '../validators/list.validator.js'; // Assuming list.validator.js exists

const router = express.Router();

// Protect all routes in this file
router.use(protect);

// --- Routes for Managing Lists ---

// @desc    Get all lists for the user's family
// @route   GET /api/lists
router.get('/', getLists);

// @desc    Create a new list
// @route   POST /api/lists
router.post('/', listValidationRules(), handleValidationErrors, createList);

// @desc    Get a single list by its ID, including all its items
// @route   GET /api/lists/:id
router.get('/:id', getListById);

// @desc    Update a list's properties (e.g., its name)
// @route   PUT /api/lists/:id
router.put('/:id', listValidationRules(), handleValidationErrors, updateList);

// @desc    Delete an entire list and all its items
// @route   DELETE /api/lists/:id
router.delete('/:id', deleteList);


// --- Routes for Managing Items within a List ---

// @desc    Add a new item to a specific list
// @route   POST /api/lists/:id/items
router.post('/:id/items', itemValidationRules(), handleValidationErrors, addItemToList);

// @desc    Update an item within a list
// @route   PUT /api/lists/:id/items/:itemId
router.put('/:id/items/:itemId', itemValidationRules(), handleValidationErrors, updateListItem);

// @desc    Delete an item from a list
// @route   DELETE /api/lists/:id/items/:itemId
router.delete('/:id/items/:itemId', deleteListItem);

// @desc    Toggle the completion status of a list item
// @route   PATCH /api/lists/:id/items/:itemId/toggle
router.patch('/:id/items/:itemId/toggle', toggleListItemCompletion);


export default router;
