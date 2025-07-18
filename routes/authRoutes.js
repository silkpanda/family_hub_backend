const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // This must match an Authorized redirect URI in your Google Cloud Console
);

// Helper function to generate an authentication URL
router.get('/google', (req, res) => {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline', // Request a refresh token
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/calendar', // Scope for Google Calendar access
        ],
        prompt: 'consent', // Always ask for consent, useful for getting a refresh token
    });
    res.json({ authUrl });
});

// Callback route after Google authentication
router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ message: 'Authorization code missing.' });
    }

    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Verify the ID token to get user info
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name: displayName } = payload;

        let user = await User.findOne({ googleId });

        if (user) {
            // Update existing user's tokens
            user.accessToken = tokens.access_token;
            user.refreshToken = tokens.refresh_token || user.refreshToken; // Only update if new refresh token is provided
        } else {
            // Create new user
            user = new User({
                googleId,
                email,
                displayName,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
            });
        }
        await user.save();

        // Redirect to your frontend with user info (or a token for your frontend session)
        // For simplicity, we'll redirect to a frontend success page. In a real app, you'd send a JWT here.
        res.redirect(`${process.env.FRONTEND_URL}/auth-success?userId=${user._id}`);

    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
});

// Middleware to protect routes (example)
const protect = async (req, res, next) => {
    // In a real application, you'd use a JWT issued by your backend after Google login.
    // For this example, we'll assume the client sends a userId and we fetch the user.
    // Replace this with proper JWT authentication for production.
    const userId = req.headers['x-user-id']; // Example: client sends user ID in header

    if (!userId) {
        return res.status(401).json({ message: 'Not authorized, no user ID' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user; // Attach user to request
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};

module.exports = router;
module.exports.protect = protect; // Export protect middleware