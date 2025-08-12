// --- File: /backend/src/api/controllers/chore.controller.js ---
// Handles the business logic for chore management and the approval workflow.

import Chore from '../../models/chore.model.js';
import Family from '../../models/family.model.js';
import { io } from '../../app.js';

// Helper function to populate chore data before sending it to the client.
const getPopulatedChore = (id) => Chore.findById(id).populate('assignedTo', 'displayName').populate('createdBy', 'displayName');

export const getChores = async (req, res, next) => {
    try {
        const chores = await Chore.find({ familyId: req.user.familyId }).populate('assignedTo', 'displayName').populate('createdBy', 'displayName');
        res.status(200).json(chores);
    } catch (error) { next(error); }
};

export const createChore = async (req, res, next) => {
    try {
        const newChore = await Chore.create({ ...req.body, familyId: req.user.familyId, createdBy: req.user.id });
        const populatedChore = await getPopulatedChore(newChore._id);
        io.to(req.user.familyId.toString()).emit('chore:created', populatedChore);
        res.status(201).json(populatedChore);
    } catch (error) { next(error); }
};

// submitChoreForApproval: Allows an AUTHENTICATED assigned user or any parent to mark a chore as 'Pending Approval'.
export const submitChoreForApproval = async (req, res, next) => {
    try {
        const chore = await Chore.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!chore) {
            return res.status(404).json({ message: 'Chore not found' });
        }

        const family = await Family.findById(req.user.familyId);
        if (!family) {
            return res.status(404).json({ message: 'Family not found for user.' });
        }

        const currentUserMember = family.members.find(m => m.userId.equals(req.user.id));
        const isParent = currentUserMember?.role === 'Parent/Guardian';
        const isAssignedUser = chore.assignedTo && chore.assignedTo.equals(req.user.id);

        if (!isAssignedUser && !isParent) {
            return res.status(403).json({ message: 'Forbidden: You can only complete your own chores, or you must be a parent.' });
        }

        chore.status = 'Pending Approval';
        await chore.save();
        const updatedChore = await getPopulatedChore(chore._id);
        io.to(req.user.familyId.toString()).emit('chore:updated', updatedChore);
        res.status(200).json(updatedChore);
    } catch (error) { 
        next(error); 
    }
};

// completeChoreForChild: Handles chore completion from the unauthenticated public profile pages.
export const completeChoreForChild = async (req, res, next) => {
    try {
        const { choreId, childId } = req.params;

        const chore = await Chore.findById(choreId);
        if (!chore) {
            return res.status(404).json({ message: 'Chore not found' });
        }

        // Security Check: Ensure the chore is actually assigned to the child whose profile is being viewed.
        if (!chore.assignedTo || !chore.assignedTo.equals(childId)) {
            return res.status(403).json({ message: 'Forbidden: This chore is not assigned to this child.' });
        }
        
        // Prevent re-submission of already completed or pending chores.
        if (chore.status !== 'Incomplete') {
            return res.status(400).json({ message: 'Chore has already been submitted.' });
        }

        chore.status = 'Pending Approval';
        await chore.save();

        const updatedChore = await getPopulatedChore(chore._id);
        // Use the chore's familyId to broadcast the update to the correct family room.
        io.to(chore.familyId.toString()).emit('chore:updated', updatedChore);
        res.status(200).json(updatedChore);
    } catch (error) {
        next(error);
    }
};


// approveChore: Allows a parent/guardian to mark a chore as 'Completed'.
export const approveChore = async (req, res, next) => {
    try {
        const chore = await Chore.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!chore) return res.status(404).json({ message: 'Chore not found' });
        chore.status = 'Completed';
        await chore.save();
        const updatedChore = await getPopulatedChore(chore._id);
        io.to(req.user.familyId.toString()).emit('chore:updated', updatedChore);
        res.status(200).json(updatedChore);
    } catch (error) { next(error); }
};

// rejectChore: Allows a parent/guardian to return a chore to the 'Incomplete' state.
export const rejectChore = async (req, res, next) => {
    try {
        const chore = await Chore.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!chore) return res.status(404).json({ message: 'Chore not found' });
        chore.status = 'Incomplete';
        await chore.save();
        const updatedChore = await getPopulatedChore(chore._id);
        io.to(req.user.familyId.toString()).emit('chore:updated', updatedChore);
        res.status(200).json(updatedChore);
    } catch (error) { next(error); }
};

export const deleteChore = async (req, res, next) => {
    try {
        const chore = await Chore.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
        if (!chore) { return res.status(404).json({ message: 'Chore not found' }); }
        io.to(req.user.familyId.toString()).emit('chore:deleted', { id: req.params.id });
        res.status(200).json({ message: 'Chore deleted successfully' });
    } catch (error) { next(error); }
};
