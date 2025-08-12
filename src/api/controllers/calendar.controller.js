// Handles the business logic for calendar event operations.

import Event from '../../models/event.model.js';
import Family from '../../models/family.model.js';
import { io } from '../../app.js'; // Import the Socket.IO instance.

const DEFAULT_EVENT_COLOR = '#3174ad';

// getEventColor: Determines the color for an event based on the first assigned user's color.
const getEventColor = async (assignedToUserIds, familyId) => {
  if (!assignedToUserIds || assignedToUserIds.length === 0) {
    return DEFAULT_EVENT_COLOR;
  }
  try {
    const family = await Family.findById(familyId).select('members.userId members.color');
    if (!family) {
      return DEFAULT_EVENT_COLOR;
    }
    const firstAssignedMemberId = assignedToUserIds[0].toString();
    const member = family.members.find(m => m.userId.toString() === firstAssignedMemberId);
    return member?.color || DEFAULT_EVENT_COLOR;
  } catch (error) {
    console.error('Error fetching family or member color:', error);
    return DEFAULT_EVENT_COLOR;
  }
};

// getEvents: Retrieves all events for the user's family.
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ familyId: req.user.familyId })
                               .populate('createdBy', 'displayName')
                               .populate('assignedTo', 'displayName');
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// createEvent: Creates a new calendar event.
export const createEvent = async (req, res, next) => {
  try {
    const { assignedTo, ...rest } = req.body;
    const eventColor = await getEventColor(assignedTo, req.user.familyId);
    const newEvent = new Event({
      ...rest,
      assignedTo: assignedTo || [],
      color: eventColor,
      createdBy: req.user.id,
      familyId: req.user.familyId
    });
    await newEvent.save();
    const populatedEvent = await Event.findById(newEvent._id)
                                      .populate('createdBy', 'displayName')
                                      .populate('assignedTo', 'displayName');
    // Broadcast the new event to all members of the family via Socket.IO.
    io.to(req.user.familyId.toString()).emit('event:created', populatedEvent);
    res.status(201).json(populatedEvent);
  } catch (error) {
    next(error);
  }
};

// updateEvent: Updates an existing calendar event.
export const updateEvent = async (req, res, next) => {
  try {
    const { assignedTo, ...updateFields } = req.body;
    const event = await Event.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const fieldsToUpdate = { ...updateFields };
    if (assignedTo !== undefined) {
      fieldsToUpdate.assignedTo = assignedTo;
      fieldsToUpdate.color = await getEventColor(assignedTo, req.user.familyId);
    }
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, fieldsToUpdate, { new: true, runValidators: true })
                                    .populate('createdBy', 'displayName')
                                    .populate('assignedTo', 'displayName');
    // Broadcast the updated event.
    io.to(req.user.familyId.toString()).emit('event:updated', updatedEvent);
    res.status(200).json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// deleteEvent: Deletes a calendar event.
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Broadcast the deletion event.
    io.to(req.user.familyId.toString()).emit('event:deleted', { id: req.params.id });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};