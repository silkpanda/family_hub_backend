// Defines the API routes for calendar event management.

import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/calendar.controller.js';
import { eventValidationRules, handleValidationErrors } from '../validators/calendar.validator.js';
import { protect } from '../middleware/auth.middleware.js';

const calendarRouter = express.Router();

// All calendar routes are protected, requiring a valid JWT.
calendarRouter.get('/events', protect, getEvents);
calendarRouter.post('/events', protect, eventValidationRules(), handleValidationErrors, createEvent);
calendarRouter.put('/events/:id', protect, eventValidationRules(), handleValidationErrors, updateEvent);
calendarRouter.delete('/events/:id', protect, deleteEvent);

export default calendarRouter;