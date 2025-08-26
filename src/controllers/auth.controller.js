// FILE: /src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const googleCallback = (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
};

const getSession = (req, res) => res.status(200).json(req.user);

const setPin = async (req, res) => {
    const { pin } = req.body;
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) return res.status(400).json({ message: 'PIN must be 4 digits.' });
    try {
        const user = await User.findById(req.user.id);
        user.pin = pin;
        user.pinIsSet = true;
        await user.save();
        res.status(200).json({ message: 'PIN set successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const pinLogin = async (req, res) => {
    const { pin } = req.body;
    try {
        const user = await User.findById(req.user.id).select('+pin');
        if (user && (await user.matchPin(pin))) {
            res.status(200).json({ message: 'PIN login successful.' });
        } else {
            res.status(401).json({ message: 'Invalid PIN.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { googleCallback, getSession, setPin, pinLogin };