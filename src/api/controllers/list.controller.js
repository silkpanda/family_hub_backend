import List from '../../models/list.model.js';
import { io } from '../../app.js';

// --- List Controllers ---

export const getLists = async (req, res, next) => {
  try {
    const lists = await List.find({ familyId: req.user.familyId });
    res.status(200).json(lists);
  } catch (error) {
    next(error);
  }
};

export const createList = async (req, res, next) => {
  try {
    const { name } = req.body;
    const newList = await List.create({
      name,
      familyId: req.user.familyId,
      items: [],
    });
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
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, familyId: req.user.familyId },
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }
    io.to(req.user.familyId.toString()).emit('list:updated', list);
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

export const deleteList = async (req, res, next) => {
  try {
    const list = await List.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }
    io.to(req.user.familyId.toString()).emit('list:deleted', { id: req.params.id });
    res.status(200).json({ message: 'List deleted successfully' });
  } catch (error) {
    next(error);
  }
};


// --- List Item Controllers ---

export const addItemToList = async (req, res, next) => {
  try {
    const { content } = req.body;
    const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }
    const newItem = {
      content,
      createdBy: req.user.id,
    };
    list.items.push(newItem);
    await list.save();
    
    // --- FIX ---
    // Instead of returning just the new item, we now return the entire updated list document.
    const updatedList = await List.findById(list._id).populate('items.createdBy', 'displayName');
    
    io.to(req.user.familyId.toString()).emit('item:added', { list: updatedList });
    res.status(201).json(updatedList);
  } catch (error) {
    next(error);
  }
};

export const updateListItem = async (req, res, next) => {
  try {
    const { content } = req.body;
    const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }
    const item = list.items.id(req.params.itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    item.content = content;
    await list.save();
    
    // --- FIX ---
    const updatedList = await List.findById(list._id).populate('items.createdBy', 'displayName');
    io.to(req.user.familyId.toString()).emit('item:updated', { list: updatedList });
    res.status(200).json(updatedList);
  } catch (error) {
    next(error);
  }
};

export const deleteListItem = async (req, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) {
        res.status(404);
        throw new Error('List not found');
    }
    const item = list.items.id(req.params.itemId);
    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }
    item.deleteOne();
    await list.save();
    io.to(req.user.familyId.toString()).emit('item:deleted', { listId: list._id, itemId: req.params.itemId });
    res.status(200).json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

export const toggleListItemCompletion = async (req, res, next) => {
    try {
        const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
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
        await list.save();
        
        // --- FIX ---
        const updatedList = await List.findById(list._id).populate('items.createdBy', 'displayName');
        io.to(req.user.familyId.toString()).emit('item:updated', { list: updatedList });
        res.status(200).json(updatedList);
    } catch (error) {
        next(error);
    }
};
