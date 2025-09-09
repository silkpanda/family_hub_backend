const Household = require('../models/Household');
const User = require('../models/User');

// Helper to get Socket.IO instance
const getSocketIo = (req) => req.app.get('socketio');

// Get all rewards for a household
const getRewards = async (req, res) => {
    try {
        const { householdId } = req.params;
        const household = await Household.findById(householdId).select('rewards');
        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }
        res.status(200).json(household.rewards || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching rewards' });
    }
};

// Add a new reward
const addReward = async (req, res) => {
    const { householdId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        household.rewards.push(req.body);
        await household.save();
        const newReward = household.rewards[household.rewards.length - 1];

        io.to(householdId).emit('reward_created', newReward);
        res.status(201).json(newReward);
    } catch (error) {
        res.status(400).json({ message: 'Error adding reward', error: error.message });
    }
};

// Update a reward
const updateReward = async (req, res) => {
    const { householdId, rewardId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const reward = household.rewards.id(rewardId);
        if (!reward) return res.status(404).json({ message: 'Reward not found' });

        reward.set(req.body);
        await household.save();

        io.to(householdId).emit('reward_updated', reward);
        res.status(200).json(reward);
    } catch (error) {
        res.status(400).json({ message: 'Error updating reward', error: error.message });
    }
};

// Delete a reward
const deleteReward = async (req, res) => {
    const { householdId, rewardId } = req.params;
    const io = getSocketIo(req);
    try {
        await Household.updateOne(
            { _id: householdId },
            { $pull: { rewards: { _id: rewardId } } }
        );
        io.to(householdId).emit('reward_deleted', rewardId);
        res.status(200).json({ message: 'Reward deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reward' });
    }
};

// --- REDEMPTION LOGIC ---

// (CHILD ACTION) Request to redeem a reward
const requestRedemption = async (req, res) => {
    const { householdId, rewardId } = req.params;
    const { userId } = req.body; // User ID of the child redeeming
    const io = getSocketIo(req);

    try {
        const household = await Household.findById(householdId);
        const user = await User.findById(userId);
        const reward = household.rewards.id(rewardId);

        if (!household || !user || !reward) {
            return res.status(404).json({ message: 'Household, user, or reward not found' });
        }

        if (user.points < reward.cost) {
            return res.status(400).json({ message: "Not enough points" });
        }

        const redemptionRequest = {
            reward: { _id: reward._id, name: reward.name, cost: reward.cost },
            user: { _id: user._id, displayName: user.displayName }
        };

        household.redemptionRequests.push(redemptionRequest);
        await household.save();
        
        const newRequest = household.redemptionRequests[household.redemptionRequests.length - 1];
        io.to(householdId).emit('redemption_requested', newRequest);

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: 'Error requesting redemption', error: error.message });
    }
};

// (PARENT ACTION) Approve a redemption request
const approveRedemption = async (req, res) => {
    const { householdId, requestId } = req.params;
    const io = getSocketIo(req);

    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const request = household.redemptionRequests.id(requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Pending request not found' });
        }

        // Deduct points
        await User.findByIdAndUpdate(request.user._id, { $inc: { points: -request.reward.cost } });

        // Update request status
        request.status = 'approved';
        request.resolvedAt = Date.now();
        await household.save();
        
        const updatedUser = await User.findById(request.user._id);

        io.to(householdId).emit('redemption_approved', request);
        io.to(householdId).emit('points_updated', { userId: updatedUser._id, newPoints: updatedUser.points });

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error approving redemption', error: error.message });
    }
};

// (PARENT ACTION) Deny a redemption request
const denyRedemption = async (req, res) => {
    const { householdId, requestId } = req.params;
    const io = getSocketIo(req);
    
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const request = household.redemptionRequests.id(requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Pending request not found' });
        }

        // Update request status
        request.status = 'denied';
        request.resolvedAt = Date.now();
        await household.save();

        io.to(householdId).emit('redemption_denied', request);
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error denying redemption', error: error.message });
    }
};


module.exports = {
    getRewards,
    addReward,
    updateReward,
    deleteReward,
    requestRedemption,
    approveRedemption,
    denyRedemption
};
