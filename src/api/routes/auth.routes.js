import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// @desc    Auth with Google - The initial request from the frontend
// @route   GET /api/auth/google
// This route uses the 'google' strategy and specifies the scope of
// information we are requesting from the user's Google account.
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// @desc    Google auth callback - The URL Google redirects to after user login
// @route   GET /api/auth/google/callback
// Passport authenticates the request. If it fails, it redirects to a login page.
// If successful, it passes control to the next handler in the chain.
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login', // A route on your frontend
    session: false // We are using JWTs, so no server session is needed
  }), 
  (req, res) => {
    // This function executes after Passport successfully authenticates the user.
    // The user object is attached to the request as req.user by Passport.
    const payload = {
      id: req.user.id,
      displayName: req.user.displayName,
      familyId: req.user.familyId // Ensure familyId is on the user object
    };

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Redirect the user back to the frontend application, passing the token
    // The frontend will then store this token to make authenticated API calls.
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

export default router;
