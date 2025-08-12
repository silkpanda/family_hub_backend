// Defines the authentication routes for the application.

import express from 'express';
import passport from 'passport';
import { googleCallback, loginWithPin } from '../controllers/auth.controller.js';

const authRouter = express.Router();

// Route to initiate Google OAuth authentication.
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent' }));

// Callback route that Google redirects to after successful authentication.
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login-failure', session: false }), googleCallback);

// Route for parent users to log in using their 4-digit PIN.
authRouter.post('/pin-login', loginWithPin);

export default authRouter;