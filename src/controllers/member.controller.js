const User = require('../models/User');
const Household = require('../models/Household');

const memberController = {
    // ... (existing functions: addMember, updateMember, deleteMember, linkCalendar)

    addMember: async (req, res) => {
        const { householdId } = req.params;
        const { displayName, role } = req.body;
        if (!displayName || !role) return res.status(400).json({ message: 'Display name and role are required.' });

        try {
            const household = await Household.findById(householdId);
            if (!household) return res.status(404).json({ message: 'Household not found.' });

            const newMember = new User({ displayName, role, isPlaceholder: true, households: [householdId] });
            await newMember.save();

            // When adding a new member, push an object with the user's ID
            household.members.push({ user: newMember._id });
            await household.save();

            const updatedHousehold = await Household.findById(householdId).populate('members.user', '-pin');
            res.status(201).json(updatedHousehold.members);
        } catch (error) {
            res.status(500).json({ message: 'Server error while adding member.' });
        }
    },

    updateMember: async (req, res) => {
        const { memberId } = req.params;
        const { displayName, role, points } = req.body;

        try {
            const member = await User.findById(memberId);
            if (!member) return res.status(404).json({ message: 'Member not found.' });

            if (displayName) member.displayName = displayName;
            if (role) member.role = role;
            if (points !== undefined) member.points = points;

            await member.save();
            res.status(200).json(member);
        } catch (error) {
            res.status(500).json({ message: 'Server error while updating member.' });
        }
    },

    deleteMember: async (req, res) => {
        const { householdId, memberId } = req.params;
        try {
            // Pull the entire member object from the array based on the user ID
            await Household.findByIdAndUpdate(householdId, { $pull: { members: { user: memberId } } });
            await User.findByIdAndDelete(memberId);
            res.status(200).json({ message: 'Member deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Server error while deleting member.' });
        }
    },

    linkCalendar: async (req, res) => {
        const { memberId } = req.params;
        try {
            const member = await User.findById(memberId);
            if (!member) {
                return res.status(404).json({ message: 'Member not found.' });
            }
            member.googleCalendarId = `linked_calendar_for_${member.displayName.replace(/\s/g, '_')}`;
            await member.save();
            res.status(200).json({ message: `Successfully linked calendar for member ${memberId}.` });
        } catch (error) {
            res.status(500).json({ message: 'Server error while linking calendar.' });
        }
    },

    // NEW FUNCTION: Handles updating a member's color
    updateMemberColor: async (req, res) => {
        const { householdId, memberId } = req.params;
        const { color } = req.body;

        if (!color) {
            return res.status(400).json({ message: 'Color is required.' });
        }

        try {
            // Find the household and update the color for the specific member
            const household = await Household.findOneAndUpdate(
                { "_id": householdId, "members.user": memberId },
                { "$set": { "members.$.color": color } },
                { new: true }
            );

            if (!household) {
                return res.status(404).json({ message: 'Household or member not found.' });
            }

            res.status(200).json({ message: 'Color updated successfully.' });
        } catch (error) {
            console.error('Error updating member color:', error);
            res.status(500).json({ message: 'Server error while updating color.' });
        }
    }
};

module.exports = memberController;
