import Family from '../../models/family.model.js';
import User from '../../models/user.model.js';
import { customAlphabet } from 'nanoid';

// Helper to generate a unique, friendly invite code
const generateInviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

// @desc    Create a new family
export const createFamily = async (req, res, next) => {
  try {
    const { familyName, userColor } = req.body;
    const ownerId = req.user.id;

    // 1. Create the new family
    const family = await Family.create({
      name: familyName,
      owner: ownerId,
      inviteCode: generateInviteCode(),
      members: [{
        userId: ownerId,
        role: 'Parent/Guardian',
        color: userColor,
      }],
    });

    // 2. Update the user who created the family
    await User.findByIdAndUpdate(ownerId, {
      familyId: family._id,
      onboardingComplete: true,
    });

    res.status(201).json(family);
  } catch (error) {
    next(error);
  }
};

// @desc    Get details of the current user's family
export const getFamilyDetails = async (req, res, next) => {
    try {
        const family = await Family.findById(req.user.familyId).populate('members.userId', 'displayName profilePhotoUrl email');
        if (!family) {
            res.status(404);
            throw new Error('Family not found.');
        }
        res.status(200).json(family);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all members of the current user's family
export const getFamilyMembers = async (req, res, next) => {
    try {
        const family = await Family.findById(req.user.familyId).populate('members.userId', 'displayName profilePhotoUrl');
        if (!family) {
            res.status(404);
            throw new Error('Family not found.');
        }
        res.status(200).json(family.members);
    } catch (error) {
        next(error);
    }
};


// @desc    Add a new member to the family
export const addFamilyMember = async (req, res, next) => {
  try {
    const { name, color, role, email } = req.body;
    const family = await Family.findById(req.user.familyId);

    if (!family || family.owner.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Only the family owner can add new members.');
    }

    let memberUserId;

    if (role === 'Child' && !email) {
      // This is a placeholder child account. Create a stub user for them.
      const placeholderEmail = `child.${Date.now()}@familyhub.local`;
      const stubUser = await User.create({
        displayName: name,
        email: placeholderEmail,
        googleId: `placeholder_${Date.now()}`,
        familyId: family._id,
        onboardingComplete: true, // They are part of a family by default
      });
      memberUserId = stubUser._id;
    } else {
      // This is a real user (Parent/Guardian or a child with an email)
      // For now, we'll create a stub user. In the future, this would send an invite.
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // In a full implementation, you'd handle inviting an existing user.
        res.status(400);
        throw new Error('User with this email already exists.');
      }
      const newUser = await User.create({
        displayName: name,
        email,
        googleId: `invited_${Date.now()}`, // Placeholder until they sign up
        familyId: family._id,
        onboardingComplete: false, // They need to complete onboarding
      });
      memberUserId = newUser._id;
    }

    // Add the new member to the family's member list
    family.members.push({ userId: memberUserId, role, color });
    await family.save();

    const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
    res.status(201).json(updatedFamily);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a family member's details
export const updateFamilyMember = async (req, res, next) => {
    // Logic to update a member's color or role
    // ... implementation needed ...
    res.status(501).json({ message: 'Not yet implemented' });
};

// @desc    Remove a member from the family
export const removeFamilyMember = async (req, res, next) => {
    // Logic to remove a member from the family
    // ... implementation needed ...
    res.status(501).json({ message: 'Not yet implemented' });
};

// @desc    Join an existing family
export const joinFamily = async (req, res, next) => {
    // Logic for a user to join a family with an invite code
    // ... implementation needed ...
    res.status(501).json({ message: 'Not yet implemented' });
};
