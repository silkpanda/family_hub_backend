// FILE: /src/routes/calendar.routes.js
const express = require('express');
const router = express.Router();
const { getAuthUrl, handleCallback, listCalendars } = require('../controllers/calendar.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/auth/url', protect, getAuthUrl);
router.get('/auth/callback', handleCallback);
router.get('/list', protect, listCalendars);

module.exports = router;