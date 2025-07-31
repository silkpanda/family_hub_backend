import List from '../../models/list.model.js';
import { io } from '../../app.js';

export const getLists = async (req, res, next) => {
  try {
    const lists = await List.find({ familyId: req.user.familyId }).populate('items.createdBy', 'displayName');
    res.status(200).json(lists);
  } catch (error) { next(error); }
};
export const createList = async (req, res, next) => {
  try {
    const newList = await List.create({ name: req.body.name, familyId: req.user.familyId, items: [] });
    io.to(req.user.familyId.toString()).emit('list:created', newList);
    res.status(201).json(newList);
  } catch (error) { next(error); }
};
export const getListById = async (req, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) { return res.status(404).json({ message: 'List not found' }); }
    res.status(200).json(list);
  } catch (error) { next(error); }
};
export const updateList = async (req, res, next) => {
  try {
    const list = await List.findOneAndUpdate({ _id: req.params.id, familyId: req.user.familyId }, { name: req.body.name }, { new: true });
    if (!list) { return res.status(404).json({ message: 'List not found' }); }
    io.to(req.user.familyId.toString()).emit('list:updated', list);
    res.status(200).json(list);
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
export const addItemToList = async (req, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) { return res.status(404).json({ message: 'List not found' }); }
    list.items.push({ content: req.body.content, createdBy: req.user.id });
    await list.save();
    const updatedList = await List.findById(list._id).populate('items.createdBy', 'displayName');
    io.to(req.user.familyId.toString()).emit('list:updated', updatedList);
    res.status(201).json(updatedList);
  } catch (error) { next(error); }
};
export const updateListItem = async (req, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) { return res.status(404).json({ message: 'List not found' }); }
    const item = list.items.id(req.params.itemId);
    if (!item) { return res.status(404).json({ message: 'Item not found' }); }
    item.content = req.body.content;
    await list.save();
    const updatedList = await List.findById(list._id).populate('items.createdBy', 'displayName');
    io.to(req.user.familyId.toString()).emit('list:updated', updatedList);
    res.status(200).json(updatedList);
  } catch (error) { next(error); }
};
export const deleteListItem = async (req, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, familyId: req.user.familyId });
    if (!list) { return res.status(404).json({ message: 'List not found' }); }
    const item = list.items.id(req.params.itemId);
    if (!item) { return res.status(404).json({ message: 'Item not found' }); }
    item.deleteOne();
    await list.save();
    const updatedList = await List.findById(list._id).populate('items.createdBy', 'displayName');
    io.to(req.user.familyId.toString()).emit('list:updated', updatedList);
    res.status(200).json({ message: 'Item deleted' });
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
    const updatedList = await List.findById(list._id).populate('items.createdBy', 'displayName');
    io.to(req.user.familyId.toString()).emit('list:updated', updatedList);
    res.status(200).json(updatedList);
  } catch (error) { next(error); }
};