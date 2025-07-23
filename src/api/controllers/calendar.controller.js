import Event from '../../models/event.model.js';
import { io } from '../../app.js'; // Import socket.io instance for real-time updates

// @desc    Get all events for the user's family
// @route   GET /api/calendar/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    // Assuming user's familyId is attached to req.user by auth middleware
    const events = await Event.find({ familyId: req.user.familyId }).populate('createdBy', 'displayName').populate('assignedTo', 'displayName');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new event
// @route   POST /api/calendar/events
// @access  Private
export const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, isAllDay, color, assignedTo } = req.body;
    
    const newEvent = new Event({
      title,
      description,
      startTime,
      endTime,
      isAllDay,
      color,
      assignedTo,
      createdBy: req.user.id, // from auth middleware
      familyId: req.user.familyId, // from auth middleware
    });

    const savedEvent = await newEvent.save();
    const populatedEvent = await Event.findById(savedEvent._id).populate('createdBy', 'displayName').populate('assignedTo', 'displayName');

    // Emit a real-time update to all members of the family
    io.to(req.user.familyId.toString()).emit('event:created', populatedEvent);

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update an existing event
// @route   PUT /api/calendar/events/:id
// @access  Private
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user belongs to the same family as the event
    if (event.familyId.toString() !== req.user.familyId.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('createdBy', 'displayName').populate('assignedTo', 'displayName');
    
    // Emit a real-time update
    io.to(req.user.familyId.toString()).emit('event:updated', updatedEvent);

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/calendar/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.familyId.toString() !== req.user.familyId.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this event' });
    }

    await event.deleteOne();

    // Emit a real-time update with the ID of the deleted event
    io.to(req.user.familyId.toString()).emit('event:deleted', { id: req.params.id });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
