// FILE: /src/routes/household.routes.js
const express = require('express');
const router = express.Router();
const { getHouseholdDetails } = require('../controllers/household.controller');
const { protect, isHouseholdMember } = require('../middleware/auth.middleware');

router.get('/:householdId', protect, isHouseholdMember, getHouseholdDetails);

module.exports = router;