// This middleware checks if the authenticated user has 'Parent/Guardian' privileges.

import Family from '../../models/family.model.js';

export const isParentOrGuardian = async (req, res, next) => {
    try {
        // Find the family associated with the user.
        const family = await Family.findById(req.user.familyId);
        if (!family) {
            return res.status(404).json({ message: 'Family not found.' });
        }
        // Find the specific member within the family.
        const member = family.members.find(m => m.userId.toString() === req.user.id);
        // Check if the member has the required role.
        if (member && member.role === 'Parent/Guardian') {
            next(); // User has the correct role, proceed.
        } else {
            res.status(403).json({ message: 'Forbidden: This action requires parent/guardian privileges.' });
        }
    } catch (error) {
        next(error); // Pass any errors to the global error handler.
    }
};
