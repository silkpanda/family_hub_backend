const express = require('express');
const calendarController = require('../controllers/calendar.controller');
const router = express.Router({ mergeParams: true });

// GET all events for the household
// This route was changed from '/' to '/events' to match the frontend API call.
router.get('/events', calendarController.getEvents);

// POST a new event
router.post('/events', calendarController.addEvent);

// PUT to update an event
router.put('/events/:eventId', calendarController.updateEvent);

// DELETE an event
router.delete('/events/:eventId', calendarController.deleteEvent);

module.exports = router;
