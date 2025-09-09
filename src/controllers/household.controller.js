const Household = require('../models/Household');

// Controller function to get household details
const getHouseholdDetails = async (req, res) => {
    try {
        const { householdId } = req.params;
        
        // Fetch the household and populate the user details for each member
        const household = await Household.findById(householdId).populate('members.user', 'displayName role points image googleCalendarId');
        
        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }
        
        res.status(200).json(household);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching household details', error: error.message });
    }
};

module.exports = {
    getHouseholdDetails,
};
