// FILE: /src/routes/auth.routes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { getSession, googleCallback, setPin, pinLogin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), googleCallback);
router.get('/session', protect, getSession);
router.post('/pin/set', protect, setPin);
router.post('/pin/login', protect, pinLogin);

module.exports = router;