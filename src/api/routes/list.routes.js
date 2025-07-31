// ===================================================================================
// File: /backend/src/api/routes/list.routes.js
// Purpose: Defines the API routes for lists and list items (CRUD operations).
//
// --- Dev Notes (UPDATE) ---
// - REMOVED the item-specific assignment route.
// - ADDED a new PATCH route: `/:id/assign`. This route allows the frontend to
//   assign one or more users to an entire list.
// ===================================================================================
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    getLists, createList, deleteList,
    addItemToList, deleteListItem, toggleListItemCompletion,
    assignList // --- NEW ---
} from '../controllers/list.controller.js';
import { listValidationRules, itemValidationRules, handleValidationErrors } from '../validators/list.validator.js';

const listRouter = express.Router();
listRouter.use(protect);

// Routes for Lists
listRouter.get('/', getLists);
listRouter.post('/', listValidationRules(), handleValidationErrors, createList);
listRouter.delete('/:id', deleteList);
listRouter.patch('/:id/assign', assignList); // --- NEW ---

// Routes for List Items
listRouter.post('/:id/items', itemValidationRules(), handleValidationErrors, addItemToList);
listRouter.delete('/:id/items/:itemId', deleteListItem);
listRouter.patch('/:id/items/:itemId/toggle', toggleListItemCompletion);

export default listRouter;
