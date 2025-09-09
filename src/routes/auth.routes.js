const express = require('express');
const passport = require('passport');
const { authController, generateToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const authRouter = express.Router();

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        const token = generateToken(req.user.id);
        res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    }
);

authRouter.get('/session', protect, authController.getSession);
authRouter.post('/pin/set', protect, authController.setPin);
authRouter.post('/pin/login', protect, authController.pinLogin);

module.exports = authRouter;
