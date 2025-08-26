// FILE: /src/controllers/household.controller.js
const Household = require('../models/Household');

exports.getHouseholdDetails = async (req, res) => {
    try {
        const household = await Household.findById(req.params.householdId).populate('members', 'displayName role image');
        if (!household) return res.status(404).json({ message: 'Household not found' });
        res.status(200).json(household);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};