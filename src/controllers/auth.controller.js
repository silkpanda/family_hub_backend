const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This function creates the JWT. We will export it so other files can use it.
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const authController = {
    // This function now correctly calls the generateToken function defined above.
    googleCallback: (req, res) => {
        const token = generateToken(req.user.id);
        res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    },

    getSession: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).populate('households').select('-pin');
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    setPin: async (req, res) => {
        try {
            const { pin } = req.body;
            if (!pin || pin.length !== 4) return res.status(400).json({ message: 'PIN must be 4 digits.' });
            const user = await User.findById(req.user.id);
            user.pin = pin;
            user.pinIsSet = true;
            await user.save();
            res.status(200).json({ message: 'PIN set successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Server Error setting PIN.' });
        }
    },

    pinLogin: async (req, res) => {
        try {
            const { pin } = req.body;
            const user = await User.findById(req.user.id).select('+pin');
            if (user && (await user.matchPin(pin))) {
                res.status(200).json({ message: 'PIN login successful.' });
            } else {
                res.status(401).json({ message: 'Invalid PIN.' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server Error during PIN login.' });
        }
    }
};

// Export both the controller object and the generateToken function
module.exports = {
    authController,
    generateToken
};
