// Handles the business logic for the rewards store.

import StoreItem from '../../models/storeItem.model.js';

export const getStoreItems = async (req, res, next) => {
    try {
        const items = await StoreItem.find({ familyId: req.user.familyId }).populate('createdBy', 'displayName');
        res.status(200).json(items);
    } catch (error) { next(error); }
};

export const createStoreItem = async (req, res, next) => {
    try {
        const newItem = await StoreItem.create({
            ...req.body,
            familyId: req.user.familyId,
            createdBy: req.user.id
        });
        res.status(201).json(newItem);
    } catch (error) { next(error); }
};

export const updateStoreItem = async (req, res, next) => {
    try {
        const updatedItem = await StoreItem.findOneAndUpdate(
            { _id: req.params.id, familyId: req.user.familyId },
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'displayName');
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(updatedItem);
    } catch (error) { next(error); }
};

export const deleteStoreItem = async (req, res, next) => {
    try {
        const item = await StoreItem.findOneAndDelete({ _id: req.params.id, familyId: req.user.familyId });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Store item deleted successfully' });
    } catch (error) { next(error); }
};
