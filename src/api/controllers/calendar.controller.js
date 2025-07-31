// ===================================================================================
// File: /backend/src/api/controllers/calendar.controller.js
// Purpose: Contains all the business logic for handling calendar-related API requests.
// ===================================================================================
import Event from '../../models/event.model.js';
import Family from '../../models/family.model.js'; // Import Family model to get member colors
import { io } from '../../app.js'; // Import the Socket.IO instance

// Default color for events if no member is assigned or color cannot be determined
const DEFAULT_EVENT_COLOR = '#3174ad'; // A neutral blue

/**
 * Helper function to determine event color based on assigned members' colors.
 * Fetches the family members' colors and applies the color of the first assigned member.
 * @param {Array<string>} assignedToUserIds - Array of User ObjectIds assigned to the event.
 * @param {string} familyId - The ObjectId of the family.
 * @returns {Promise<string>} The determined event color.
 */
const getEventColor = async (assignedToUserIds, familyId) => {
  if (!assignedToUserIds || assignedToUserIds.length === 0) {
    console.log('[getEventColor] No assigned members, using default color.');
    return DEFAULT_EVENT_COLOR;
  }

  try {
    const family = await Family.findById(familyId).select('members.userId members.color');
    if (!family) {
      console.warn(`[getEventColor] Family ${familyId} not found for color lookup. Using default.`);
      return DEFAULT_EVENT_COLOR;
    }

    // Find the color of the first assigned member
    const firstAssignedMemberId = assignedToUserIds[0].toString();
    const member = family.members.find(m => m.userId.toString() === firstAssignedMemberId);

    if (member && member.color) {
      console.log(`[getEventColor] Using color '${member.color}' from assigned member ${member.userId} (family ${familyId}).`);
      return member.color;
    } else {
      console.warn(`[getEventColor] Color not found for assigned member ${firstAssignedMemberId} in family ${familyId}. Using default.`);
      return DEFAULT_EVENT_COLOR;
    }
  } catch (error) {
    console.error('[getEventColor] Error fetching family or member color:', error);
    return DEFAULT_EVENT_COLOR;
  }
};


/**
 * Retrieves all calendar events for the authenticated user's family.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const getEvents = async (req, res, next) => {
  try {
    console.log('--- getEvents START (Backend) ---');
    // Find events belonging to the user's family, populate creator and assigned users for display.
    const events = await Event.find({ familyId: req.user.familyId })
                                .populate('createdBy', 'displayName')
                                .populate('assignedTo', 'displayName'); // Keep populating assignedTo for frontend display
    console.log(`[CalendarController] Fetched ${events.length} events for family ${req.user.familyId}.`);
    res.status(200).json(events);
  } catch (error) { 
    console.error('[CalendarController] Error fetching events:', error);
    next(error); 
  } finally {
    console.log('--- getEvents END (Backend) ---');
  }
};

/**
 * Creates a new calendar event.
 * Determines event color based on `assignedTo` members.
 * Emits a 'event:created' WebSocket event to the family's room.
 * @param {Object} req - The Express request object, containing event data in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const createEvent = async (req, res, next) => {
  try {
    console.log('--- createEvent START (Backend) ---');
    console.log('[createEvent] Request body:', req.body);
    const { assignedTo, ...rest } = req.body;

    // Determine the event color based on assignedTo members
    const eventColor = await getEventColor(assignedTo, req.user.familyId);

    // Create a new Event document, linking it to the creating user and their family.
    const newEvent = new Event({ 
      ...rest, 
      assignedTo: assignedTo || [], // Ensure assignedTo is an array
      color: eventColor, // Set the determined color
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
    console.log(`[CalendarController] Emitted 'event:created' for family ${req.user.familyId}: ${populatedEvent.title} (Color: ${populatedEvent.color})`);
    
    res.status(201).json(populatedEvent);
  } catch (error) { 
    console.error('[CalendarController] Error creating event:', error);
    next(error); 
  } finally {
    console.log('--- createEvent END (Backend) ---');
  }
};

/**
 * Updates an existing calendar event.
 * Determines event color based on `assignedTo` members if `assignedTo` is updated.
 * Emits an 'event:updated' WebSocket event to the family's room.
 * @param {Object} req - The Express request object, with `id` in `req.params` and updated data in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const updateEvent = async (req, res, next) => {
  try {
    console.log('--- updateEvent START (Backend) ---');
    console.log('[updateEvent] Request params:', req.params);
    console.log('[updateEvent] Request body:', req.body); // Check this log carefully for what's sent during drag

    const { assignedTo, color, ...updateFields } = req.body; // Destructure assignedTo and color (if present)
    
    // Find the current event state from the database
    const event = await Event.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!event) { 
      console.warn(`[updateEvent] Event ${req.params.id} not found or not in family ${req.user.familyId}.`);
      return res.status(404).json({ message: 'Event not found' }); 
    }

    // Prepare fields to update. Start with everything from the request body except assignedTo/color.
    const fieldsToUpdate = { ...updateFields };

    // Handle assignedTo: ONLY update if explicitly provided in the request body.
    // If not provided (e.g., drag-and-drop), retain existing assignedTo value.
    if (assignedTo !== undefined) { // Check if assignedTo was sent in the request
        fieldsToUpdate.assignedTo = assignedTo; // Use the provided assignedTo array
        // Recalculate color if assignedTo was provided/changed
        fieldsToUpdate.color = await getEventColor(assignedTo, req.user.familyId);
        console.log(`[updateEvent] AssignedTo updated. New color determined: ${fieldsToUpdate.color}`);
    } else {
        // If assignedTo was NOT provided in the request, keep the existing assignedTo.
        // This is crucial for drag-and-drop where only times change.
        fieldsToUpdate.assignedTo = event.assignedTo;
        // Also keep the existing color, unless a specific color was sent (unlikely from drag, but safe to check)
        fieldsToUpdate.color = color || event.color; 
        console.log(`[updateEvent] AssignedTo NOT provided in request. Retaining existing assignedTo and color: ${fieldsToUpdate.color}`);
    }

    // Perform the update with the carefully constructed fieldsToUpdate object
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id, 
      fieldsToUpdate, // Use the prepared fields
      { new: true, runValidators: true } 
    )
    .populate('createdBy', 'displayName')
    .populate('assignedTo', 'displayName');

    // Emit WebSocket event to all clients in the same family room.
    io.to(req.user.familyId.toString()).emit('event:updated', updatedEvent);
    console.log(`[CalendarController] Emitted 'event:updated' for family ${req.user.familyId}: ${updatedEvent.title} (Color: ${updatedEvent.color})`);
    
    res.status(200).json(updatedEvent);
  } catch (error) { 
    console.error(`[CalendarController] Error updating event ${req.params.id}:`, error);
    next(error); 
  } finally {
    console.log('--- updateEvent END (Backend) ---');
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
    console.log('--- deleteEvent START (Backend) ---');
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
  } finally {
    console.log('--- deleteEvent END (Backend) ---');
  }
};