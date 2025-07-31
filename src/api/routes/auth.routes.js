// /backend/src/api/routes/auth.routes.js

import express from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/auth.controller.js';

const authRouter = express.Router();

// Route to start the Google login flow
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'], accessType: 'offline', prompt: 'consent' }));

// The real callback route that processes the login
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login-failure', session: false }), googleCallback);

export default authRouter;