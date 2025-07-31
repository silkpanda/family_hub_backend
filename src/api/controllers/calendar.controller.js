// ===================================================================================
// File: /backend/src/api/controllers/calendar.controller.js
// Purpose: Contains all the business logic for handling calendar-related API requests.
// ===================================================================================
import Event from '../../models/event.model.js';
import { io } from '../../app.js'; // Import the Socket.IO instance

/**
 * Retrieves all calendar events for the authenticated user's family.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const getEvents = async (req, res, next) => {
  try {
    // Find events belonging to the user's family, populate creator and assigned users for display.
    const events = await Event.find({ familyId: req.user.familyId })
                                .populate('createdBy', 'displayName')
                                .populate('assignedTo', 'displayName');
    console.log(`[CalendarController] Fetched ${events.length} events for family ${req.user.familyId}.`);
    res.status(200).json(events);
  } catch (error) { 
    console.error('[CalendarController] Error fetching events:', error);
    next(error); 
  }
};

/**
 * Creates a new calendar event.
 * Emits a 'event:created' WebSocket event to the family's room.
 * @param {Object} req - The Express request object, containing event data in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const createEvent = async (req, res, next) => {
  try {
    // Create a new Event document, linking it to the creating user and their family.
    const newEvent = new Event({ 
      ...req.body, 
      createdBy: req.user.id, 
      familyId: req.user.familyId 
    });
    await newEvent.save();

    // Populate the created event for broadcasting (to include displayName, etc.).
    const populatedEvent = await Event.findById(newEvent._id)
                                    .populate('createdBy', 'displayName')
                                    .populate('assignedTo', 'displayName');

    // Emit WebSocket event to all clients in the same family room.
    io.to(req.user.familyId.toString()).emit('event:created', populatedEvent);
    console.log(`[CalendarController] Emitted 'event:created' for family ${req.user.familyId}: ${populatedEvent.title}`);
    
    res.status(201).json(populatedEvent);
  } catch (error) { 
    console.error('[CalendarController] Error creating event:', error);
    next(error); 
  }
};

/**
 * Updates an existing calendar event.
 * Emits an 'event:updated' WebSocket event to the family's room.
 * @param {Object} req - The Express request object, with `id` in `req.params` and updated data in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const updateEvent = async (req, res, next) => {
  try {
    // Find the event by ID and ensure it belongs to the user's family.
    const event = await Event.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!event) { 
      console.warn(`[CalendarController] Event ${req.params.id} not found or not in family ${req.user.familyId}.`);
      return res.status(404).json({ message: 'Event not found' }); 
    }

    // Update the event, returning the new document.
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
                                    .populate('createdBy', 'displayName')
                                    .populate('assignedTo', 'displayName');

    // Emit WebSocket event to all clients in the same family room.
    io.to(req.user.familyId.toString()).emit('event:updated', updatedEvent);
    console.log(`[CalendarController] Emitted 'event:updated' for family ${req.user.familyId}: ${updatedEvent.title}`);
    
    res.status(200).json(updatedEvent);
  } catch (error) { 
    console.error(`[CalendarController] Error updating event ${req.params.id}:`, error);
    next(error); 
  }
};

/**
 * Deletes a calendar event.
 * Emits an 'event:deleted' WebSocket event to the family's room.
 * @param {Object} req - The Express request object, with `id` in `req.params`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const deleteEvent = async (req, res, next) => {
  try {
    // Find and delete the event, ensuring it belongs to the user's family.
    const event = await Event.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
    if (!event) { 
      console.warn(`[CalendarController] Event ${req.params.id} not found or not in family ${req.user.familyId} for deletion.`);
      return res.status(404).json({ message: 'Event not found' }); 
    }

    // Emit WebSocket event with the ID of the deleted event.
    io.to(req.user.familyId.toString()).emit('event:deleted', { id: req.params.id });
    console.log(`[CalendarController] Emitted 'event:deleted' for family ${req.user.familyId}: ID ${req.params.id}`);
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) { 
    console.error(`[CalendarController] Error deleting event ${req.params.id}:`, error);
    next(error); 
  }
};