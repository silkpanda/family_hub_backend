const express = require('express');
const calendarController = require('../controllers/calendar.controller');
const router = express.Router({ mergeParams: true });

// GET all events for the household
router.get('/', calendarController.getEvents);

// POST a new event
router.post('/', calendarController.addEvent);

// PUT to update an event
router.put('/:eventId', calendarController.updateEvent);

// DELETE an event
router.delete('/:eventId', calendarController.deleteEvent);

module.exports = router;

