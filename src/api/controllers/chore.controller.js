import Chore from '../../models/chore.model.js';
import { io } from '../../app.js';

// @desc    Get all chores for the family
// @route   GET /api/chores
export const getChores = async (req, res, next) => {
  try {
    const chores = await Chore.find({ familyId: req.user.familyId }).populate('assignedTo', 'displayName');
    res.status(200).json(chores);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new chore
// @route   POST /api/chores
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
    const populatedChore = await Chore.findById(newChore._id).populate('assignedTo', 'displayName');
    io.to(req.user.familyId.toString()).emit('chore:created', populatedChore);
    res.status(201).json(populatedChore);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a chore
// @route   PUT /api/chores/:id
export const updateChore = async (req, res, next) => {
  try {
    const chore = await Chore.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }
    const updatedChore = await Chore.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedTo', 'displayName');
    io.to(req.user.familyId.toString()).emit('chore:updated', updatedChore);
    res.status(200).json(updatedChore);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chore
// @route   DELETE /api/chores/:id
export const deleteChore = async (req, res, next) => {
  try {
    const chore = await Chore.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }
    io.to(req.user.familyId.toString()).emit('chore:deleted', { id: req.params.id });
    res.status(200).json({ message: 'Chore deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle a chore's completion status
// @route   PATCH /api/chores/:id/toggle
export const toggleChoreCompletion = async (req, res, next) => {
  try {
    const chore = await Chore.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!chore) {
      res.status(404);
      throw new Error('Chore not found');
    }
    chore.isComplete = !chore.isComplete;
    await chore.save();
    const populatedChore = await Chore.findById(chore._id).populate('assignedTo', 'displayName');
    io.to(req.user.familyId.toString()).emit('chore:updated', populatedChore);
    res.status(200).json(populatedChore);
  } catch (error) {
    next(error);
  }
};
