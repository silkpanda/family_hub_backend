const express = require('express');
const rewardController = require('../controllers/reward.controller');
const router = express.Router({ mergeParams: true });

// === Standard Reward Management ===
// GET all rewards
router.get('/', rewardController.getRewards);
// POST a new reward
router.post('/', rewardController.addReward);
// PUT to update a specific reward
router.put('/:rewardId', rewardController.updateReward);
// DELETE a specific reward
router.delete('/:rewardId', rewardController.deleteReward);

// === New Redemption Approval Routes ===
// POST to request a redemption (child action)
router.post('/:rewardId/redeem', rewardController.requestRedemption);
// POST to approve a redemption request (parent action)
router.post('/requests/:requestId/approve', rewardController.approveRedemption);
// POST to deny a redemption request (parent action)
router.post('/requests/:requestId/deny', rewardController.denyRedemption);

module.exports = router;

