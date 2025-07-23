import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/calendar.controller.js';
import { eventValidationRules, handleValidationErrors } from '../validators/calendar.validator.js';
import { protect } from '../middleware/auth.middleware.js'; // Assuming you have this middleware

const router = express.Router();

// All routes in this file are protected and require authentication
router.use(protect);

// GET /api/calendar/events - Get all events
router.get('/events', getEvents);

// POST /api/calendar/events - Create a new event
router.post('/events', eventValidationRules(), handleValidationErrors, createEvent);

// PUT /api/calendar/events/:id - Update an event
router.put('/events/:id', eventValidationRules(), handleValidationErrors, updateEvent);

// DELETE /api/calendar/events/:id - Delete an event
router.delete('/events/:id', deleteEvent);

export default router;
