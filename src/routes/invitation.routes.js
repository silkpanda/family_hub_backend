// FILE: /src/routes/invitation.routes.js
const express = require('express');
const router = express.Router();
const { createInvitation, joinWithCode } = require('../controllers/invitation.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create', protect, createInvitation);
router.post('/join', protect, joinWithCode);

module.exports = router;