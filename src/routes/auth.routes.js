const express = require('express');
const passport = require('passport');
const router = express.Router();

// --- The Main Google Authentication Route ---
// When the user clicks "Login with Google", they are sent to this endpoint.
// Passport then redirects them to Google's authentication screen.
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly']
}));


// --- The Callback Route ---
// After the user approves the login on Google's site, Google sends them back here.
// This version uses a custom callback for a more robust, explicit session handling.
router.get(
    '/google/callback',
    // First, Passport authenticates the request.
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
    // If authentication is successful, this function is executed.
    (req, res) => {
        // req.login() is a Passport function that establishes the session.
        // We are ensuring the session is saved before redirecting.
        req.session.save(() => {
            console.log('[Auth Routes] Session saved. Redirecting to client URL.');
            res.redirect(process.env.CLIENT_URL);
        });
    }
);

// --- Get Current User Session ---
// The frontend calls this endpoint on startup to check if a user is already logged in.
router.get('/session', (req, res) => {
    if (req.user) {
        // If a user is found in the session, send their details back.
        res.status(200).json({ user: req.user });
    } else {
        // If no user is found, send a 401 Unauthorized status.
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// --- Logout Route ---
router.post('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        // After logging out, destroy the session and clear the cookie.
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Successfully logged out' });
        });
    });
});

module.exports = router;

