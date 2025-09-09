const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Household = require('../models/Household');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-pin');
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const isHouseholdMember = async (req, res, next) => {
    const { householdId } = req.params;
    const userId = req.user?._id;

    if (!householdId || !userId) {
        return res.status(400).json({ message: "Missing household or user ID." });
    }

    try {
        // More efficient check: ask the DB if a household exists with this ID AND this user as a member.
        const household = await Household.findOne({ _id: householdId, 'members.user': userId });

        if (household) {
            // User is a member, proceed to the actual route handler (e.g., getHouseholdDetails)
            next();
        } else {
            // No such household/member combination found.
            return res.status(403).json({ message: "User is not a member of this household." });
        }
    } catch (error) {
        console.error("Error in isHouseholdMember middleware:", error);
        res.status(500).json({ message: "Server error checking household membership." });
    }
};

module.exports = { protect, isHouseholdMember };

