import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getChores, createChore, updateChore, deleteChore, toggleChoreCompletion } from '../controllers/chore.controller.js';
import { choreValidationRules, handleValidationErrors } from '../validators/chore.validator.js';

const choreRouter = express.Router();

choreRouter.use(protect);

choreRouter.get('/', getChores);
choreRouter.post('/', choreValidationRules(), handleValidationErrors, createChore);
choreRouter.put('/:id', choreValidationRules(), handleValidationErrors, updateChore);
choreRouter.delete('/:id', deleteChore);
choreRouter.patch('/:id/toggle', toggleChoreCompletion);

export default choreRouter;