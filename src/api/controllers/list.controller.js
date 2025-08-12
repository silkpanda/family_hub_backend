// Handles the business logic for shared list operations.

import List from '../../models/list.model.js';
import { io } from '../../app.js';

// Helper function to populate list data before sending to the client.
const populateFields = (query) => {
    return query
        .populate('items.createdBy', 'displayName')
        .populate('assignedTo', 'displayName');
};

export const getLists = async (req, res, next) => {
    try {
        const lists = await populateFields(List.find({ familyId: req.user.familyId }));
        res.status(200).json(lists);
    } catch (error) { next(error); }
};

export const addItemToList = async (req, res, next) => {
    try {
        const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!list) { return res.status(404).json({ message: 'List not found' }); }
        const newItem = { content: req.body.content, createdBy: req.user.id };
        list.items.push(newItem);
        await list.save();
        const updatedList = await populateFields(List.findById(list._id));
        io.to(req.user.familyId.toString()).emit('list:updated', updatedList);
        res.status(201).json(updatedList);
    } catch (error) { next(error); }
};

export const assignList = async (req, res, next) => {
    try {
        const { userIds } = req.body;
        const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!list) { return res.status(404).json({ message: 'List not found' }); }
        list.assignedTo = userIds || [];
        await list.save();
        const updatedList = await populateFields(List.findById(list._id));
        io.to(req.user.familyId.toString()).emit('list:updated', updatedList);
        res.status(200).json(updatedList);
    } catch (error) {
        next(error);
    }
};

export const createList = async (req, res, next) => {
    try {
        const newList = await List.create({ name: req.body.name, familyId: req.user.familyId, items: [], assignedTo: [] });
        io.to(req.user.familyId.toString()).emit('list:created', newList);
        res.status(201).json(newList);
    } catch (error) { next(error); }
};

export const deleteList = async (req, res, next) => {
    try {
        const list = await List.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
        if (!list) { return res.status(404).json({ message: 'List not found' }); }
        io.to(req.user.familyId.toString()).emit('list:deleted', { id: req.params.id });
        res.status(200).json({ message: 'List deleted successfully' });
    } catch (error) { next(error); }
};

export const deleteListItem = async (req, res, next) => {
    try {
        const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!list) { return res.status(404).json({ message: 'List not found' }); }
        const item = list.items.id(req.params.itemId);
        if (!item) { return res.status(404).json({ message: 'Item not found' }); }
        item.deleteOne(); // Mongoose subdocument deletion
        await list.save();
        const updatedList = await populateFields(List.findById(list._id));
        io.to(req.user.familyId.toString()).emit('list:updated', updatedList);
        res.status(200).json(updatedList);
    } catch (error) { next(error); }
};

export const toggleListItemCompletion = async (req, res, next) => {
    try {
        const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!list) { return res.status(404).json({ message: 'List not found' }); }
        const item = list.items.id(req.params.itemId);
        if (!item) { return res.status(404).json({ message: 'Item not found' }); }
        item.isComplete = !item.isComplete;
        await list.save();
        const updatedList = await populateFields(List.findById(list._id));
        io.to(req.user.familyId.toString()).emit('list:updated', updatedList);
        res.status(200).json(updatedList);
    } catch (error) { next(error); }
};