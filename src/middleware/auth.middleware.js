// FILE: /src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-pin').populate('households', 'name');
            if (!req.user) return res.status(401).json({ message: 'User not found' });
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) res.status(401).json({ message: 'Not authorized, no token' });
};

const isHouseholdMember = async (req, res, next) => {
    const householdId = req.params.householdId;
    if (req.user.households.some(h => h._id.toString() === householdId)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. You are not a member of this household.' });
    }
};

module.exports = { protect, isHouseholdMember }