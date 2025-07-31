// ===================================================================================
// File: /backend/src/api/controllers/family.controller.js
// Purpose: Contains all the business logic for handling family-related API requests.
// ===================================================================================
import Family from '../../models/family.model.js';
import User from '../../models/user.model.js';
import { customAlphabet } from 'nanoid';

// Function to generate a unique invite code for families
// Using a limited alphabet to make codes more easily human-readable and pronounceable.
const generateInviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

/**
 * Retrieves details for the family the authenticated user belongs to.
 * This is a critical endpoint for determining if a user is onboarded.
 *
 * @param {Object} req - The Express request object, expected to have `req.user` populated by auth middleware.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function for error handling.
 */
export const getFamilyDetails = async (req, res, next) => {
    try {
        console.log('--- getFamilyDetails START (Backend) ---');
        console.log('Authenticated User ID from JWT (req.user.id):', req.user.id);
        console.log('User Family ID from DB (req.user.familyId):', req.user.familyId); 
        
        if (!req.user.familyId) {
            console.log('[FamilyController] User does NOT have a familyId set in their document. Sending 404 response to frontend for onboarding.');
            return res.status(404).json({ message: 'User is not part of a family.' });
        }

        const family = await Family.findById(req.user.familyId).populate('members.userId', 'displayName profilePhotoUrl email');
        
        console.log('[FamilyController] Family document found in DB:', !!family);
        if (!family) {
            console.log(`[FamilyController] Family document with ID ${req.user.familyId} not found in DB. Data inconsistency.`);
            return res.status(404).json({ message: 'Family not found.' });
        }

        console.log('[FamilyController] Successfully retrieved family details for family:', family.name);
        res.status(200).json(family);
    } catch (error) { 
        console.error('[FamilyController] Error in getFamilyDetails:', error);
        next(error); 
    } finally {
        console.log('--- getFamilyDetails END (Backend) ---');
    }
};

/**
 * Creates a new family and assigns the current authenticated user as the owner.
 * Also updates the user's document with the new familyId.
 *
 * @param {Object} req - The Express request object, containing `familyName` and `userColor` in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const createFamily = async (req, res, next) => {
    try {
        console.log('--- createFamily START (Backend) ---');
        const { familyName, userColor } = req.body;
        const ownerId = req.user.id; 
        
        const family = await Family.create({
            name: familyName, 
            owner: ownerId, 
            inviteCode: generateInviteCode(),
            members: [{ userId: ownerId, role: 'Parent/Guardian', color: userColor }],
        });

        await User.findByIdAndUpdate(ownerId, { familyId: family._id, onboardingComplete: true });

        const updatedUserAfterCreate = await User.findById(ownerId);
        console.log(`[FamilyController] User '${updatedUserAfterCreate.displayName}' familyId after creation: ${updatedUserAfterCreate.familyId}`);
        
        console.log('[FamilyController] Family created successfully:', family.name, 'with ID:', family._id);
        res.status(201).json(family);
    } catch (error) { 
        console.error('[FamilyController] Error in createFamily:', error);
        next(error); 
    } finally {
        console.log('--- createFamily END (Backend) ---');
    }
};

/**
 * Adds a new member to an existing family (can be an existing user by email or a new placeholder child).
 * Only the family owner can perform this action.
 *
 * @param {Object} req - The Express request object, containing `name`, `color`, `role`, and optional `email` in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const addFamilyMember = async (req, res, next) => {
    try {
        console.log('--- addFamilyMember START (Backend) ---');
        console.log('[addFamilyMember] Request body:', req.body); // Log incoming request body
        const { name, color, role, email } = req.body;
        const family = await Family.findById(req.user.familyId);

        if (!family || family.owner.toString() !== req.user.id) {
            console.warn(`[addFamilyMember] Unauthorized attempt: User ${req.user.id} tried to add member to family ${req.user.familyId} without being owner.`);
            return res.status(403).json({ message: 'Only the family owner can add new members.' });
        }

        let userToUpdate;
        if (email) {
            userToUpdate = await User.findOne({ email });
            if (userToUpdate && userToUpdate.familyId) {
                console.warn(`[addFamilyMember] Conflict: User with email ${email} is already in a family.`);
                return res.status(400).json({ message: 'User with this email is already in a family.' });
            }
        }
        
        if (!userToUpdate) {
            const placeholderEmail = `child.${Date.now()}@familyhub.local`;
            console.log(`[addFamilyMember] Creating new placeholder user for name: ${name}, email: ${email || 'N/A'}`);
            userToUpdate = await User.create({
                displayName: name, 
                email: email || placeholderEmail, 
                googleId: `placeholder_${Date.now()}`,
            });
            console.log(`[addFamilyMember] New placeholder user created with ID: ${userToUpdate._id}`);
        } else {
            console.log(`[addFamilyMember] Found existing user: ${userToUpdate.displayName} (ID: ${userToUpdate._id})`);
        }

        await User.findByIdAndUpdate(userToUpdate._id, { familyId: family._id, onboardingComplete: true });
        console.log(`[addFamilyMember] User ${userToUpdate._id} assigned to family ${family._id}.`);
        
        family.members.push({ userId: userToUpdate._id, role, color });
        await family.save();
        console.log(`[addFamilyMember] Member added to family members array. Family saved.`);

        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        console.log(`[addFamilyMember] Successfully added member '${name}' to family '${family.name}'.`);
        res.status(201).json(updatedFamily);
    } catch (error) { 
        console.error('[addFamilyMember] Error details:', error); // Log full error object
        console.error(`[addFamilyMember] Error message: ${error.message}`);
        // Check for specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation failed: ${messages.join(', ')}` });
        }
        // Generic error response
        next(error); 
    } finally {
        console.log('--- addFamilyMember END (Backend) ---');
    }
};

/**
 * Retrieves a list of all members for the authenticated user's family.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const getFamilyMembers = async (req, res, next) => {
    try {
        console.log('--- getFamilyMembers START (Backend) ---');
        const family = await Family.findById(req.user.familyId).populate('members.userId', 'displayName profilePhotoUrl');
        if (!family) { 
            console.warn('[getFamilyMembers] Family not found for members request. User might have a stale familyId or data is corrupted.');
            return res.status(404).json({ message: 'Family not found.' }); 
        }
        console.log(`[getFamilyMembers] Retrieved ${family.members.length} members for family ${family.name}.`);
        res.status(200).json(family.members);
    } catch (error) { 
        console.error('[getFamilyMembers] Error in getFamilyMembers:', error);
        next(error); 
    } finally {
        console.log('--- getFamilyMembers END (Backend) ---');
    }
};

/**
 * Allows an authenticated user to join an existing family using an invite code.
 *
 * @param {Object} req - The Express request object, containing `inviteCode` and `userColor` in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const joinFamily = async (req, res, next) => {
    try {
        console.log('--- joinFamily START (Backend) ---');
        console.log('[joinFamily] Request body:', req.body); // Log incoming request body
        const { inviteCode, userColor } = req.body;
        const family = await Family.findOne({ inviteCode });
        if (!family) { 
            console.warn(`[joinFamily] Failed to join: Invalid invite code provided: '${inviteCode}'.`);
            return res.status(404).json({ message: 'Invalid invite code.' }); 
        }

        const user = await User.findById(req.user.id);
        if (user.familyId) { 
            console.warn(`[joinFamily] User '${user.displayName}' (ID: ${user.id}) attempted to join family '${family._id}' but is already in family '${user.familyId}'.`);
            return res.status(400).json({ message: 'User is already in a family.' }); 
        }

        user.familyId = family._id;
        user.onboardingComplete = true;
        family.members.push({ userId: user._id, role: 'Parent/Guardian', color: userColor });
        
        await user.save(); 
        await family.save();

        console.log(`[joinFamily] User '${user.displayName}' familyId after joining: ${user.familyId}`);

        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        console.log(`[joinFamily] User ${user.displayName} successfully joined family ${family.name}.`);
        res.status(200).json(updatedFamily);
    } catch (error) { 
        console.error('[joinFamily] Error details:', error); // Log full error object
        console.error(`[joinFamily] Error message: ${error.message}`);
        next(error); 
    } finally {
        console.log('--- joinFamily END (Backend) ---');
    }
};

/**
 * Removes a member from the family. Only the family owner can perform this.
 * Prevents the owner from removing themselves.
 *
 * @param {Object} req - The Express request object, with `memberId` in `req.params`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const removeFamilyMember = async (req, res, next) => {
    try {
        console.log('--- removeFamilyMember START (Backend) ---');
        console.log('[removeFamilyMember] Attempting to remove member ID:', req.params.memberId);
        const { memberId } = req.params;
        const family = await Family.findById(req.user.familyId);

        if (!family || family.owner.toString() !== req.user.id) {
            console.warn(`[removeFamilyMember] Unauthorized attempt: User ${req.user.id} tried to remove member from family ${req.user.familyId} without being owner.`);
            return res.status(403).json({ message: 'Only the family owner can remove members.' });
        }
        
        if (memberId === req.user.id) {
            console.warn(`[removeFamilyMember] Attempted to remove self: User ${req.user.id} tried to remove their own account.`);
            return res.status(400).json({ message: 'You cannot remove yourself from the family.' });
        }

        const initialMemberCount = family.members.length;
        family.members = family.members.filter(member => member.userId.toString() !== memberId);
        
        if (family.members.length === initialMemberCount) {
             console.warn(`[removeFamilyMember] Member ${memberId} not found in family ${family._id}. No change made.`);
             return res.status(404).json({ message: 'Family member not found.' });
        }

        await family.save(); 
        
        await User.findByIdAndUpdate(memberId, { $unset: { familyId: 1, onboardingComplete: 1 } });
        console.log(`[removeFamilyMember] Member ${memberId} successfully removed from family '${family.name}'.`);
        res.status(200).json(family); // Returning the family object (unpopulated for simplicity here)
    } catch (error) { 
        console.error('[removeFamilyMember] Error details:', error); // Log full error object
        console.error(`[removeFamilyMember] Error message: ${error.message}`);
        next(error); 
    } finally {
        console.log('--- removeFamilyMember END (Backend) ---');
    }
};

/**
 * Updates the name of the family. Only the family owner can perform this.
 *
 * @param {Object} req - The Express request object, with `name` in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const updateFamily = async (req, res, next) => {
    try {
        console.log('--- updateFamily START (Backend) ---');
        console.log('[updateFamily] Request body:', req.body); // Log incoming request body
        const { name } = req.body;
        const family = await Family.findById(req.user.familyId);

        if (!family || family.owner.toString() !== req.user.id) {
            console.warn(`[updateFamily] Unauthorized attempt: User ${req.user.id} tried to update family ${req.user.familyId} without being owner.`);
            return res.status(403).json({ message: 'Only the family owner can edit the family name.' });
        }
        
        family.name = name;
        await family.save();

        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        console.log(`[updateFamily] Family name successfully updated to: '${updatedFamily.name}' (ID: ${updatedFamily._id}).`);
        res.status(200).json(updatedFamily);
    } catch (error) { 
        console.error('[updateFamily] Error details:', error); // Log full error object
        console.error(`[updateFamily] Error message: ${error.message}`);
        next(error); 
    } finally {
        console.log('--- updateFamily END (Backend) ---');
    }
};

/**
 * Updates properties of a specific family member (e.g., name, color, role).
 * Only the family owner can perform this action.
 *
 * @param {Object} req - The Express request object, with `memberId` in `req.params` and update data in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export const updateFamilyMember = async (req, res, next) => {
    try {
        console.log('--- updateFamilyMember START (Backend) ---');
        console.log('[updateFamilyMember] Request params:', req.params); // Log incoming params
        console.log('[updateFamilyMember] Request body:', req.body); // Log incoming request body

        const { memberId } = req.params;
        const { name, color, role } = req.body;
        const family = await Family.findById(req.user.familyId);

        if (!family || family.owner.toString() !== req.user.id) {
            console.warn(`[updateFamilyMember] Unauthorized attempt: User ${req.user.id} tried to update member ${memberId} in family ${req.user.familyId} without being owner.`);
            return res.status(403).json({ message: 'Only the family owner can edit members.' });
        }
        
        const member = family.members.find(m => m.userId.toString() === memberId);
        if (!member) { 
            console.warn(`[updateFamilyMember] Attempted to update non-existent member ${memberId} in family ${family._id}.`);
            return res.status(404).json({ message: 'Family member not found.' }); 
        }

        console.log(`[updateFamilyMember] Found member to update: ${member.userId.displayName}`);
        
        if (color) {
            const oldColor = member.color;
            member.color = color;
            console.log(`[updateFamilyMember] Updated member color from ${oldColor} to ${color}`);
        }
        if (role) {
            const oldRole = member.role;
            member.role = role;
            console.log(`[updateFamilyMember] Updated member role from ${oldRole} to ${role}`);
        }
        
        await family.save(); 
        console.log('[updateFamilyMember] Family document saved after member updates (color/role).');

        if (name) {
            const userToUpdate = await User.findById(memberId);
            if (!userToUpdate) {
                console.warn(`[updateFamilyMember] User document for memberId ${memberId} not found, but member existed in family array.`);
                // This might be a data inconsistency, but shouldn't block the family member update.
            } else {
                const oldDisplayName = userToUpdate.displayName;
                userToUpdate.displayName = name;
                await userToUpdate.save(); // Save the User document for displayName update
                console.log(`[updateFamilyMember] Updated user display name from ${oldDisplayName} to '${name}'. User document saved.`);
            }
        }

        const updatedFamily = await Family.findById(family._id).populate('members.userId', 'displayName profilePhotoUrl email');
        console.log(`[updateFamilyMember] Successfully updated member ${memberId} in family '${updatedFamily.name}'.`);
        // Frontend expects 'data' key for this response.
        res.status(200).json({ data: updatedFamily }); 
    } catch (error) { 
        console.error('[updateFamilyMember] Error details:', error); // Log full error object for deep dive
        console.error(`[updateFamilyMember] Error message: ${error.message}`);
        // Check for specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation failed: ${messages.join(', ')}` });
        }
        next(error); 
    } finally {
        console.log('--- updateFamilyMember END (Backend) ---');
    }
};