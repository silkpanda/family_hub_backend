const express = require('express');
const passport = require('passport');
const router = express.Router();

// Route to start the Google authentication process
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
        accessType: 'offline',
        prompt: 'consent'
    })
);

// --- THIS IS THE FIX ---
// This is the callback route that Google will redirect to after a successful login.
// It is now configured to redirect the user back to your live Netlify frontend.
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL}/login`, // Redirect to login on failure
    }),
    (req, res) => {
        // On successful authentication, redirect to the frontend dashboard.
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

// Route to check the current user's session status
router.get('/session', (req, res) => {
    if (req.user) {
        res.json({
            isAuthenticated: true,
            user: req.user,
            activeHouseholdId: req.session.activeHouseholdId || null,
        });
    } else {
        res.status(401).json({ isAuthenticated: false });
    }
});

// Route to handle user logout
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Could not log out, please try again.' });
            }
            res.clearCookie('connect.sid'); // The default session cookie name
            res.status(200).json({ message: 'Logged out successfully' });
        });
    });
});

module.exports = router;

