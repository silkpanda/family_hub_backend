const { customAlphabet } = require('nanoid');
const Invitation = require('../models/Invitation');
const Household = require('../models/Household');
const User = require('../models/User');

const invitationController = {
    createInvitation: async (req, res) => {
        const { householdId } = req.body;
        try {
            const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
            const inviteCode = nanoid();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await Invitation.create({ inviter: req.user._id, household: householdId, inviteCode, expiresAt });
            res.status(201).json({ inviteCode, expiresAt });
        } catch (error) {
            res.status(500).json({ message: 'Server Error creating invitation' });
        }
    },

    joinWithCode: async (req, res) => {
        const { inviteCode } = req.body;
        try {
            const invite = await Invitation.findOne({ inviteCode });
            if (!invite) return res.status(404).json({ message: 'Invalid or expired invite code.' });

            await Household.findByIdAndUpdate(invite.household, { $addToSet: { members: req.user._id } });
            const updatedUser = await User.findByIdAndUpdate(req.user._id, { $addToSet: { households: invite.household } }, { new: true }).populate('households', 'name');
            await invite.remove();
            res.status(200).json({ message: 'Successfully joined household.', user: updatedUser });
        } catch (error) {
            res.status(500).json({ message: 'Server Error joining household' });
        }
    }
};

module.exports = invitationController;
