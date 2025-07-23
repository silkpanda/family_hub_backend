import List from '../../models/list.model.js';
import { io } from '../../app.js';

// --- List Management ---

export const getLists = async (req, res, next) => {
  try {
    const lists = await List.find({ familyId: req.user.familyId }).select('-items'); // Exclude items for a lightweight response
    res.status(200).json(lists);
  } catch (error) {
    next(error);
  }
};

export const createList = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    const newList = await List.create({ name, type, familyId: req.user.familyId });
    io.to(req.user.familyId.toString()).emit('list:created', newList);
    res.status(201).json(newList);
  } catch (error) {
    next(error);
  }
};

export const getListById = async (req, res, next) => {
    try {
        const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!list) {
            res.status(404);
            throw new Error('List not found');
        }
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

export const updateList = async (req, res, next) => {
    try {
        const { name } = req.body;
        const list = await List.findOneAndUpdate(
            { _id: req.params.id, familyId: req.user.familyId },
            { name },
            { new: true, runValidators: true }
        );
        if (!list) {
            res.status(404);
            throw new Error('List not found');
        }
        io.to(req.user.familyId.toString()).emit('list:updated', { id: list._id, name: list.name });
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

export const deleteList = async (req, res, next) => {
    try {
        const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
        if (!list) {
            res.status(404);
            throw new Error('List not found');
        }
        await list.deleteOne();
        io.to(req.user.familyId.toString()).emit('list:deleted', { id: req.params.id });
        res.status(200).json({ message: 'List deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// --- List Item Management ---

export const addItemToList = async (req, res, next) => {
  try {
    const { text } = req.body;
    const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }
    const newItem = { text, createdBy: req.user.id };
    list.items.push(newItem);
    await list.save();
    const addedItem = list.items[list.items.length - 1]; // Get the newly added item with its generated _id
    io.to(req.user.familyId.toString()).emit('item:created', { listId: list._id, item: addedItem });
    res.status(201).json(addedItem);
  } catch (error) {
    next(error);
  }
};

export const updateListItem = async (req, res, next) => {
    try {
        const { text } = req.body;
        const list = await List.findOneAndUpdate(
            { "_id": req.params.id, "familyId": req.user.familyId, "items._id": req.params.itemId },
            { "$set": { "items.$.text": text } },
            { new: true }
        );
        if (!list) {
            res.status(404);
            throw new Error('List or item not found');
        }
        const updatedItem = list.items.id(req.params.itemId);
        io.to(req.user.familyId.toString()).emit('item:updated', { listId: list._id, item: updatedItem });
        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
};

export const deleteListItem = async (req, res, next) => {
    try {
        const list = await List.findOneAndUpdate(
            { "_id": req.params.id, "familyId": req.user.familyId },
            { "$pull": { "items": { "_id": req.params.itemId } } },
            { new: true }
        );
        if (!list) {
            res.status(404);
            throw new Error('List not found');
        }
        io.to(req.user.familyId.toString()).emit('item:deleted', { listId: list._id, itemId: req.params.itemId });
        res.status(200).json({ message: 'Item deleted' });
    } catch (error) {
        next(error);
    }
};

export const toggleListItemCompletion = async (req, res, next) => {
    try {
        const list = await List.findOne({ "_id": req.params.id, "familyId": req.user.familyId });
        if (!list) {
            res.status(404);
            throw new Error('List not found');
        }
        const item = list.items.id(req.params.itemId);
        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }
        item.isComplete = !item.isComplete;
        if (item.isComplete) {
            item.completedBy = req.user.id;
            item.completedAt = new Date();
        } else {
            item.completedBy = undefined;
            item.completedAt = undefined;
        }
        await list.save();
        io.to(req.user.familyId.toString()).emit('item:updated', { listId: list._id, item });
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};
