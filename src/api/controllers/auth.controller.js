// ===================================================================================
// File: /src/api/controllers/auth.controller.js
// Purpose: Contains the logic for handling the final step of the OAuth flow.
// ===================================================================================
import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';

// NOTE: The dotenv.config() call has been removed.
// The environment variables are now loaded by the start script in package.json.

/**
 * Handles the callback from Google after successful authentication.
 * It creates a JWT containing essential user info and redirects back to the frontend.
 */
export const googleCallback = (req, res) => {
  try {
    // The `req.user` object is populated by the Passport strategy.
    const payload = {
      id: req.user.id,
      displayName: req.user.displayName,
      familyId: req.user.familyId,
    };

    // Sign the token with a secret and set an expiration date.
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Redirect the user back to the frontend's callback page.
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Error in googleCallback:', error);
    // If an error occurs, redirect to a failure page on the frontend.
    res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
  }
};
