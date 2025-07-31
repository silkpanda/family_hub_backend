// ===================================================================================
// File: /backend/src/api/controllers/chore.controller.js
// Purpose: Contains all the business logic for handling chore-related API requests.
// ===================================================================================
import Chore from '../../models/chore.model.js';
import { io } from '../../app.js'; // Ensure 'io' is imported from app.js

export const getChores = async (req, res, next) => {
  try {
    const chores = await Chore.find({ familyId: req.user.familyId }).populate('assignedTo', 'displayName');
    res.status(200).json(chores);
  } catch (error) { next(error); }
};

export const createChore = async (req, res, next) => {
  try {
    const newChore = await Chore.create({ ...req.body, familyId: req.user.familyId, createdBy: req.user.id });
    const populatedChore = await Chore.findById(newChore._id).populate('assignedTo', 'displayName');
    // Log event emission
    io.to(req.user.familyId.toString()).emit('chore:created', populatedChore);
    console.log(`[ChoreController] Emitted 'chore:created' for family ${req.user.familyId}:`, populatedChore.title);
    res.status(201).json(populatedChore);
  } catch (error) { next(error); }
};

export const updateChore = async (req, res, next) => {
  try {
    const chore = await Chore.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!chore) {
      return res.status(404).json({ message: 'Chore not found' });
    }
    const updatedChore = await Chore.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedTo', 'displayName');
    // Log event emission
    io.to(req.user.familyId.toString()).emit('chore:updated', updatedChore);
    console.log(`[ChoreController] Emitted 'chore:updated' for family ${req.user.familyId}:`, updatedChore.title);
    res.status(200).json(updatedChore);
  } catch (error) {
    next(error);
  }
};

export const deleteChore = async (req, res, next) => {
  try {
    const chore = await Chore.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
    if (!chore) { return res.status(404).json({ message: 'Chore not found' }); }
    // Log event emission
    io.to(req.user.familyId.toString()).emit('chore:deleted', { id: req.params.id });
    console.log(`[ChoreController] Emitted 'chore:deleted' for family ${req.user.familyId}: chore ID ${req.params.id}`);
    res.status(200).json({ message: 'Chore deleted successfully' });
  } catch (error) { next(error); }
};

export const toggleChoreCompletion = async (req, res, next) => {
  try {
    const chore = await Chore.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!chore) { return res.status(404).json({ message: 'Chore not found' }); }
    chore.isComplete = !chore.isComplete;
    await chore.save();
    const populatedChore = await Chore.findById(chore._id).populate('assignedTo', 'displayName');
    // Log event emission
    io.to(req.user.familyId.toString()).emit('chore:updated', populatedChore); // Toggle is also an update
    console.log(`[ChoreController] Emitted 'chore:updated' (toggle) for family ${req.user.familyId}: ${populatedChore.title}, Complete: ${populatedChore.isComplete}`);
    res.status(200).json(populatedChore);
  } catch (error) { next(error); }
};