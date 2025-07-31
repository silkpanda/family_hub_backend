// ===================================================================================
// File: /backend/src/api/routes/list.routes.js
// ===================================================================================
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getLists, createList, getListById, updateList, deleteList, addItemToList, updateListItem, deleteListItem, toggleListItemCompletion } from '../controllers/list.controller.js';
import { listValidationRules, itemValidationRules, handleValidationErrors } from '../validators/list.validator.js';


const listRouter = express.Router();
listRouter.use(protect);
listRouter.get('/', getLists);
listRouter.post('/', listValidationRules(), handleValidationErrors, createList);
listRouter.get('/:id', getListById);
listRouter.put('/:id', listValidationRules(), handleValidationErrors, updateList);
listRouter.delete('/:id', deleteList);
listRouter.post('/:id/items', itemValidationRules(), handleValidationErrors, addItemToList);
listRouter.put('/:id/items/:itemId', itemValidationRules(), handleValidationErrors, updateListItem);
listRouter.delete('/:id/items/:itemId', deleteListItem);
listRouter.patch('/:id/items/:itemId/toggle', toggleListItemCompletion);
export default listRouter;
