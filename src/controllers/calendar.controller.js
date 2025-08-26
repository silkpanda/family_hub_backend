// FILE: /src/controllers/calendar.controller.js
const { google } = require('googleapis');
const User = require('../models/User');

const getOauth2Client = (refreshToken) => {
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
};

const getAuthUrl = (req, res) => {
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const url = oauth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes, state: req.user.id });
    res.status(200).json({ url });
};

const handleCallback = async (req, res) => {
    const { code, state } = req.query;
    const userId = state;
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
    try {
        const { tokens } = await oauth2Client.getToken(code);
        if (tokens.refresh_token) {
            await User.findByIdAndUpdate(userId, { googleRefreshToken: tokens.refresh_token });
        }
        res.redirect(`${process.env.CLIENT_URL}/manage?calendar_auth=success`);
    } catch (error) {
        res.redirect(`${process.env.CLIENT_URL}/manage?calendar_auth=error`);
    }
};

const listCalendars = async (req, res) => {
    if (!req.user.googleRefreshToken) return res.status(400).json({ message: 'Google Calendar not connected.' });
    try {
        const oauth2Client = getOauth2Client(req.user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const result = await calendar.calendarList.list();
        res.status(200).json(result.data.items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch calendar list.' });
    }
};

module.exports = { getAuthUrl, handleCallback, listCalendars };