// Defines the API routes for the rewards store.

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { isParentOrGuardian } from '../middleware/role.middleware.js';
import { getStoreItems, createStoreItem, updateStoreItem, deleteStoreItem } from '../controllers/store.controller.js';

const storeRouter = express.Router();

storeRouter.use(protect); // All store routes are protected.

// Route for all users to view store items.
storeRouter.get('/items', getStoreItems);
// Routes restricted to parents/guardians for managing store items.
storeRouter.post('/items', isParentOrGuardian, createStoreItem);
storeRouter.put('/items/:id', isParentOrGuardian, updateStoreItem);
storeRouter.delete('/items/:id', isParentOrGuardian, deleteStoreItem);

export default storeRouter;