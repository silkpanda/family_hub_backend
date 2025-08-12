// Handles the business logic for family and member management.

import Family from '../../models/family.model.js';
import User from '../../models/user.model.js';
import { customAlphabet } from 'nanoid';

// Generates a unique, user-friendly 6-character invite code.
const generateInviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export const getFamilyDetails = async (req, res, next) => {
    try {
        if (!req.user.familyId) {
            return res.status(404).json({ message: 'User is not part of a family.' });
        }
        const family = await Family.findById(req.user.familyId).populate('members.userId', 'displayName profilePhotoUrl email');
        if (!family) {
            return res.status(404).json({ message: 'Family not found.' });
        }
        res.status(200).json({ data: family });
    } catch (error) {
        next(error);
    }
};

export const createFamily = async (req, res, next) => {
    try {
        const { familyName, userColor } = req.body;
        const ownerId = req.user.id;
        const family = await Family.create({
            name: familyName,
            owner: ownerId,
            inviteCode: generateInviteCode(),
            members: [{ userId: ownerId, role: 'Parent/Guardian', color: userColor }],
        });
        await User.findByIdAndUpdate(ownerId, { familyId: family._id, onboardingComplete: true });
        const populatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(201).json({ data: populatedFamily });
    } catch (error) {
        next(error);
    }
};

// addFamilyMember: Adds a new member to the family, creating a placeholder user if necessary.
export const addFamilyMember = async (req, res, next) => {
    try {
        const { name, color, role, email } = req.body;
        const family = await Family.findById(req.user.familyId);
        if (!family || family.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the family owner can add new members.' });
        }
        let userToUpdate;
        if (email) {
            userToUpdate = await User.findOne({ email });
            if (userToUpdate && userToUpdate.familyId) {
                return res.status(400).json({ message: 'User with this email is already in a family.' });
            }
        }
        // If no user exists with the email (or no email provided), create a new placeholder user.
        if (!userToUpdate) {
            const placeholderEmail = `child.${Date.now()}@familyhub.local`;
            userToUpdate = await User.create({
                displayName: name,
                email: email || placeholderEmail,
                googleId: `placeholder_${Date.now()}`,
            });
        }
        await User.findByIdAndUpdate(userToUpdate._id, { familyId: family._id, onboardingComplete: true });
        family.members.push({ userId: userToUpdate._id, role, color });
        await family.save();
        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(201).json({ data: updatedFamily });
    } catch (error) {
        next(error);
    }
};

export const getFamilyMembers = async (req, res, next) => {
    try {
        const family = await Family.findById(req.user.familyId).populate('members.userId', 'displayName profilePhotoUrl');
        if (!family) {
            return res.status(404).json({ message: 'Family not found.' });
        }
        res.status(200).json(family.members);
    } catch (error) {
        next(error);
    }
};

export const joinFamily = async (req, res, next) => {
    try {
        const { inviteCode, userColor } = req.body;
        const family = await Family.findOne({ inviteCode });
        if (!family) {
            return res.status(404).json({ message: 'Invalid invite code.' });
        }
        const user = await User.findById(req.user.id);
        if (user.familyId) {
            return res.status(400).json({ message: 'User is already in a family.' });
        }
        user.familyId = family._id;
        user.onboardingComplete = true;
        family.members.push({ userId: user._id, role: 'Parent/Guardian', color: userColor });
        await user.save();
        await family.save();
        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(200).json({ data: updatedFamily });
    } catch (error) {
        next(error);
    }
};

export const removeFamilyMember = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const family = await Family.findById(req.user.familyId);
        if (!family || family.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the family owner can remove members.' });
        }
        if (memberId === req.user.id) {
            return res.status(400).json({ message: 'You cannot remove yourself from the family.' });
        }
        const initialMemberCount = family.members.length;
        family.members = family.members.filter(member => member.userId.toString() !== memberId);
        if (family.members.length === initialMemberCount) {
            return res.status(404).json({ message: 'Family member not found.' });
        }
        await family.save();
        // Remove the familyId from the removed user's document.
        await User.findByIdAndUpdate(memberId, { $unset: { familyId: 1, onboardingComplete: 1 } });
        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(200).json({ data: updatedFamily });
    } catch (error) {
        next(error);
    }
};

export const updateFamily = async (req, res, next) => {
    try {
        const { name } = req.body;
        const family = await Family.findById(req.user.familyId);
        if (!family || family.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the family owner can edit the family name.' });
        }
        family.name = name;
        await family.save();
        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(200).json({ data: updatedFamily });
    } catch (error) {
        next(error);
    }
};

export const updateFamilyMember = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { name, color, role } = req.body;
        const family = await Family.findById(req.user.familyId);
        if (!family || family.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the family owner can edit members.' });
        }
        const member = family.members.find(m => m.userId.toString() === memberId);
        if (!member) {
            return res.status(404).json({ message: 'Family member not found.' });
        }
        if (color) member.color = color;
        if (role) member.role = role;
        await family.save();
        if (name) {
            await User.findByIdAndUpdate(memberId, { displayName: name });
        }
        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(200).json({ data: updatedFamily });
    } catch (error) {
        next(error);
    }
};

export const setMemberPin = async (req, res, next) => {
    try {
        const { pin } = req.body;
        const { memberId } = req.params;
        if (req.user.id !== memberId) {
            return res.status(403).json({ message: 'Forbidden: You can only set your own PIN.' });
        }
        if (!pin || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({ message: 'PIN must be a 4-digit number.' });
        }
        const family = await Family.findById(req.user.familyId);
        if (!family) return res.status(404).json({ message: 'Family not found.' });
        const member = family.members.find(m => m.userId.toString() === memberId);
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        // The 'save' pre-hook on the Family model will hash the PIN.
        member.pin = pin;
        await family.save();
        res.status(200).json({ message: 'PIN updated successfully.' });
    } catch (error) {
        next(error);
    }
};