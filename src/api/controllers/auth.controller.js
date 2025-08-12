// Handles the logic for authentication-related requests.

import jwt from 'jsonwebtoken';
import Family from '../../models/family.model.js';

// googleCallback: Called after successful Google authentication.
// It generates a JWT and redirects the user back to the frontend.
export const googleCallback = (req, res) => {
  try {
    const payload = { id: req.user.id, displayName: req.user.displayName, familyId: req.user.familyId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
  }
};

// loginWithPin: Handles the login process for parents using a 4-digit PIN.
export const loginWithPin = async (req, res, next) => {
    try {
        const { memberId, pin } = req.body;
        if (!memberId || !pin) {
            return res.status(400).json({ message: 'Member ID and PIN are required.' });
        }

        // Find the family and select the PIN field, which is normally hidden.
        const family = await Family.findOne({ "members.userId": memberId })
            .select('+members.pin')
            .populate('members.userId');

        if (!family) {
            return res.status(404).json({ message: 'Member not found.' });
        }

        const member = family.members.find(m => m.userId._id.toString() === memberId);
        if (!member || member.role !== 'Parent/Guardian') {
            return res.status(403).json({ message: 'Only parents or guardians can log in with a PIN.' });
        }

        if (!member.pin) {
             return res.status(401).json({ message: 'PIN not set for this user.' });
        }

        // Compare the provided PIN with the hashed PIN in the database.
        const isMatch = await member.comparePin(pin);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid PIN.' });
        }

        // If PIN is valid, generate a JWT for the user.
        const user = member.userId;
        const payload = { id: user._id, displayName: user.displayName, familyId: user.familyId };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ token, user: payload });

    } catch (error) {
        next(error);
    }
};