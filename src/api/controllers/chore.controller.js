import Chore from '../../models/chore.model.js'; // Assuming chore.model.js exists
import User from '../../models/user.model.js';
import { io } from '../../app.js';

// @desc    Get all chores for the user's family
// @route   GET /api/chores
// @access  Private
export const getChores = async (req, res, next) => {
  try {
    const chores = await Chore.find({ familyId: req.user.familyId }).populate('assignedTo', 'displayName color');
    res.status(200).json(chores);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new chore
// @route   POST /api/chores
// @access  Private
export const createChore = async (req, res, next) => {
  try {
    const { title, description, assignedTo, points, dueDate } = req.body;
    const newChore = await Chore.create({
      title,
      description,
      assignedTo,
      points,
      dueDate,
      familyId: req.user.familyId,
      createdBy: req.user.id,
    });

    const populatedChore = await Chore.findById(newChore._id).populate('assignedTo', 'displayName color');
    io.to(req.user.familyId.toString()).emit('chore:created', populatedChore);
    res.status(201).json(populatedChore);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a chore
// @route   PUT /api/chores/:id
// @access  Private
export const updateChore = async (req, res, next) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore || chore.familyId.toString() !== req.user.familyId.toString()) {
      res.status(404);
      throw new Error('Chore not found or user not authorized');
    }

    const updatedChore = await Chore.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedTo', 'displayName color');
    io.to(req.user.familyId.toString()).emit('chore:updated', updatedChore);
    res.status(200).json(updatedChore);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chore
// @route   DELETE /api/chores/:id
// @access  Private
export const deleteChore = async (req, res, next) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore || chore.familyId.toString() !== req.user.familyId.toString()) {
      res.status(404);
      throw new Error('Chore not found or user not authorized');
    }
    await chore.deleteOne();
    io.to(req.user.familyId.toString()).emit('chore:deleted', { id: req.params.id });
    res.status(200).json({ message: 'Chore deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle a chore's completion status
// @route   PATCH /api/chores/:id/toggle
// @access  Private
export const toggleChoreCompletion = async (req, res, next) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore || chore.familyId.toString() !== req.user.familyId.toString()) {
        res.status(404);
        throw new Error('Chore not found or user not authorized');
    }

    // Toggle completion status and set completion details
    chore.isComplete = !chore.isComplete;
    if (chore.isComplete) {
        chore.completedBy = req.user.id;
        chore.completedAt = new Date();
        // Add points to the user who completed it, if applicable
        if (chore.points > 0 && chore.assignedTo) {
            await User.findByIdAndUpdate(chore.assignedTo, { $inc: { points: chore.points } });
        }
    } else {
        // Revert points if a chore is marked as incomplete
        if (chore.points > 0 && chore.assignedTo) {
            await User.findByIdAndUpdate(chore.assignedTo, { $inc: { points: -chore.points } });
        }
        chore.completedBy = undefined;
        chore.completedAt = undefined;
    }

    await chore.save();
    const populatedChore = await Chore.findById(chore._id).populate('assignedTo', 'displayName color');
    
    io.to(req.user.familyId.toString()).emit('chore:updated', populatedChore);
    res.status(200).json(populatedChore);
  } catch (error) {
    next(error);
  }
};
