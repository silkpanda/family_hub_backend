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
// This simplified version relies on Passport's default, robust session handling.
router.get(
    '/google/callback',
    // Passport first authenticates the request. On success, it automatically
    // calls req.login() and establishes a session.
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL}/login`,
        failureMessage: true // Provides more detailed failure messages if needed
    }),
    // If passport.authenticate() is successful, this function is called.
    // The user is now authenticated and a session is established.
    (req, res) => {
        // The session is established. We just need to redirect the user.
        console.log('[Auth Routes] Passport authentication successful. Redirecting to client URL.');
        res.redirect(process.env.CLIENT_URL);
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
    const householdId = req.user?.activeHouseholdId; // Store householdId before logout
    req.logout(function(err) {
        if (err) { return next(err); }
        // After logging out, destroy the session and clear the cookie.
        req.session.destroy(() => {
            // Emit a socket event to notify clients in the specific household
            if (householdId && req.app.get('socketio')) {
                req.app.get('socketio').to(householdId).emit('user_logged_out');
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Successfully logged out' });
        });
    });
});

module.exports = router;

