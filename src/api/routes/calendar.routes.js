// ===================================================================================
// File: /backend/src/api/routes/calendar.routes.js
// ===================================================================================
import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/calendar.controller.js';
import { eventValidationRules, handleValidationErrors } from '../validators/calendar.validator.js';
import { protect } from '../middleware/auth.middleware.js';


const calendarRouter = express.Router();
calendarRouter.use(protect);
calendarRouter.get('/events', getEvents);
calendarRouter.post('/events', eventValidationRules(), handleValidationErrors, createEvent);
calendarRouter.put('/events/:id', eventValidationRules(), handleValidationErrors, updateEvent);
calendarRouter.delete('/events/:id', deleteEvent);
export default calendarRouter;
