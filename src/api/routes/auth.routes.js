import express from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/auth.controller.js';

const router = express.Router();

// @desc    Authenticate with Google
// @route   GET /api/auth/google
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile', // Gets basic profile information (name, photo)
      'email',   // Gets the user's primary email address
      // IMPORTANT: Add the Google Calendar scope to request permission.
      // This is essential for the 2-way sync feature.
      'https://www.googleapis.com/auth/calendar' 
    ],
    // 'access_type: offline' is crucial for getting a refresh token,
    // which allows your server to access the user's calendar even when they are not online.
    accessType: 'offline', 
    prompt: 'consent' // This ensures a refresh token is sent every time.
  })
);

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  '/google/callback',
  // Authenticate with passport. If it fails, redirect to a login failure page.
  passport.authenticate('google', { 
    failureRedirect: '/login-failure', // A route on your frontend
    session: false // We are using JWTs, so no server session is needed
  }),
  // If authentication succeeds, the 'googleCallback' controller is called.
  googleCallback 
);

export default router;
