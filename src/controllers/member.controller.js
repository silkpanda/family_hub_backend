// FILE: /src/controllers/member.controller.js
const User = require('../models/User');
const Household = require('../models/Household');

const addMember = async (req, res) => {
    const { householdId } = req.params;
    const { displayName, role } = req.body;
    if (!displayName || !role) return res.status(400).json({ message: 'Display name and role are required.' });
    try {
        const newMember = await User.create({ displayName, role, isPlaceholder: true, households: [householdId] });
        await Household.findByIdAndUpdate(householdId, { $addToSet: { members: newMember._id } });
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding member.' });
    }
};

const updateMember = async (req, res) => {
    const { memberId } = req.params;
    const { displayName, role } = req.body;
    try {
        const updatedMember = await User.findByIdAndUpdate(memberId, { displayName, role }, { new: true });
        if (!updatedMember) return res.status(404).json({ message: 'Member not found.' });
        res.status(200).json(updatedMember);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating member.' });
    }
};

const deleteMember = async (req, res) => {
    const { householdId, memberId } = req.params;
    try {
        const member = await User.findById(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        await Household.findByIdAndUpdate(householdId, { $pull: { members: memberId } });
        if (member.isPlaceholder) {
            await User.findByIdAndDelete(memberId);
        } else {
            await User.findByIdAndUpdate(memberId, { $pull: { households: householdId } });
        }
        res.status(200).json({ message: 'Member removed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting member.' });
    }
};

module.exports = { addMember, updateMember, deleteMember };