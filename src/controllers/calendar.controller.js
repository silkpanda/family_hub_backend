const Household = require('../models/Household');

// Helper function to get the Socket.IO instance from the request
const getSocketIo = (req) => req.app.get('socketio');

// --- Controller Functions ---

const getEvents = async (req, res) => {
    try {
        const { householdId } = req.params;
        const household = await Household.findById(householdId).select('calendarEvents');
        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }
        res.status(200).json(household.calendarEvents || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching events', error: error.message });
    }
};

const addEvent = async (req, res) => {
    const { householdId } = req.params;
    const { title, start, end, allDay } = req.body;
    const io = getSocketIo(req);

    try {
        const household = await Household.findById(householdId);
        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }

        household.calendarEvents.push({ title, start, end, allDay });
        await household.save();

        // Get the newly created event (it will be the last one in the array)
        const newEvent = household.calendarEvents[household.calendarEvents.length - 1];

        // Emit a WebSocket event to all clients in the household room
        io.to(householdId).emit('event_created', newEvent);

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: 'Error adding event', error: error.message });
    }
};

const updateEvent = async (req, res) => {
    const { householdId, eventId } = req.params;
    const eventUpdates = req.body;
    const io = getSocketIo(req);

    try {
        const household = await Household.findById(householdId);
        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }

        const event = household.calendarEvents.id(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.set(eventUpdates);
        await household.save();
        
        // After saving, the 'event' object has the updated data
        io.to(householdId).emit('event_updated', event);

        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({ message: 'Error updating event', error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    const { householdId, eventId } = req.params;
    const io = getSocketIo(req);

    try {
        await Household.updateOne(
            { _id: householdId },
            { $pull: { calendarEvents: { _id: eventId } } }
        );

        // Emit a WebSocket event with the ID of the deleted event
        io.to(householdId).emit('event_deleted', eventId);

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
};

module.exports = {
    getEvents,
    addEvent,
    updateEvent,
    deleteEvent,
};

