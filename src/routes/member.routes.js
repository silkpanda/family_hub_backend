// FILE: /src/routes/member.routes.js
const express = require('express');
const router = express.Router();
const { addMember, updateMember, deleteMember } = require('../controllers/member.controller');
const { protect, isHouseholdMember } = require('../middleware/auth.middleware');

router.post('/:householdId/members', protect, isHouseholdMember, addMember);
router.put('/:householdId/members/:memberId', protect, isHouseholdMember, updateMember);
router.delete('/:householdId/members/:memberId', protect, isHouseholdMember, deleteMember);

module.exports = router;