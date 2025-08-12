// Defines the API routes for managing shared lists.

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getLists, createList, deleteList, addItemToList, deleteListItem, toggleListItemCompletion, assignList } from '../controllers/list.controller.js';
import { listValidationRules, itemValidationRules, handleValidationErrors } from '../validators/list.validator.js';

const listRouter = express.Router();
listRouter.use(protect); // All list routes are protected.

// Routes for list-level operations.
listRouter.get('/', getLists);
listRouter.post('/', listValidationRules(), handleValidationErrors, createList);
listRouter.delete('/:id', deleteList);
listRouter.patch('/:id/assign', assignList);

// Routes for item-level operations within a list.
listRouter.post('/:id/items', itemValidationRules(), handleValidationErrors, addItemToList);
listRouter.delete('/:id/items/:itemId', deleteListItem);
listRouter.patch('/:id/items/:itemId/toggle', toggleListItemCompletion);

export default listRouter;