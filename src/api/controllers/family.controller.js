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
      const placeholderEmail = `child.${Date.now()}@familyhub.local`;
      const stubUser = await User.create({
        displayName: name,
        email: placeholderEmail,
        googleId: `placeholder_${Date.now()}`,
        familyId: family._id,
        onboardingComplete: true,
      });
      memberUserId = stubUser._id;
    } else {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400);
        throw new Error('User with this email already exists.');
      }
      const newUser = await User.create({
        displayName: name,
        email,
        googleId: `invited_${Date.now()}`,
        familyId: family._id,
        onboardingComplete: false,
      });
      memberUserId = newUser._id;
    }

    family.members.push({ userId: memberUserId, role, color });
    await family.save();

    const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
    res.status(201).json(updatedFamily);
  } catch (error) {
    next(error);
  }
};

// --- NEW ---
// @desc    Update the family's details (e.g., name)
export const updateFamily = async (req, res, next) => {
    try {
        const { name } = req.body;
        const family = await Family.findById(req.user.familyId);

        if (!family || family.owner.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Only the family owner can edit the family name.');
        }

        family.name = name;
        await family.save();
        
        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(200).json(updatedFamily);
    } catch (error) {
        next(error);
    }
};

// --- UPDATED ---
// @desc    Update a family member's details
export const updateFamilyMember = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { name, color, role } = req.body;
        const family = await Family.findById(req.user.familyId);

        if (!family || family.owner.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Only the family owner can edit members.');
        }

        const member = family.members.find(m => m.userId.toString() === memberId);
        if (!member) {
            res.status(404);
            throw new Error('Family member not found.');
        }

        let warning = null;

        if (color && color !== member.color) {
            const isDuplicateColor = family.members.some(m => m.userId.toString() !== memberId && m.color === color);
            if (isDuplicateColor) {
                warning = 'Another family member is already using this color.';
            }
            member.color = color;
        }

        if (role) {
            member.role = role;
        }

        await family.save();

        if (name) {
            await User.findByIdAndUpdate(memberId, { displayName: name });
        }
        
        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(200).json({ data: updatedFamily, warning });

    } catch (error) {
        next(error);
    }
};

// @desc    Remove a member from the family
export const removeFamilyMember = async (req, res, next) => {
    res.status(501).json({ message: 'Not yet implemented' });
};

// --- UPDATED ---
// @desc    Join an existing family
export const joinFamily = async (req, res, next) => {
    try {
        const { inviteCode, userColor } = req.body;
        const user = req.user;

        const family = await Family.findOne({ inviteCode });
        if (!family) {
            res.status(404);
            throw new Error('Family with this invite code not found.');
        }

        // Add the user to the new family
        family.members.push({
            userId: user.id,
            role: 'Parent/Guardian', // Default role for joining
            color: userColor,
        });
        await family.save();

        // Update the user's document
        await User.findByIdAndUpdate(user.id, {
            familyId: family._id,
            onboardingComplete: true,
        });

        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        res.status(200).json(updatedFamily);
    } catch (error) {
        next(error);
    }
};
