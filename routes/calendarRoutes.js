const express = require('express');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Event = require('../models/Event');
const { protect } = require('./authRoutes'); // Import the protect middleware

const router = express.Router();

// Helper to get an authenticated Google Calendar client
async function getGoogleCalendarClient(user) {
    const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials from user's stored tokens
    oAuth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
    });

    // Handle token refresh automatically
    oAuth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            user.refreshToken = tokens.refresh_token; // Update refresh token if it changes
        }
        user.accessToken = tokens.access_token;
        user.updatedAt = Date.now(); // Mark for update
        await user.save();
    });

    return google.calendar({ version: 'v3', auth: oAuth2Client });
}


// --- API Endpoints ---

// Initial Sync: Pull events from Google Calendar to MongoDB
router.get('/sync-from-google', protect, async (req, res) => {
    try {
        const user = req.user;
        const calendar = await getGoogleCalendarClient(user);

        const response = await calendar.events.list({
            calendarId: user.googleCalendarId,
            timeMin: (new Date()).toISOString(), // Get events from now onwards
            maxResults: 100, // Limit results, paginate if many events
            singleEvents: true,
            orderBy: 'startTime',
        });

        const googleEvents = response.data.items;

        // Iterate through Google events and save/update in MongoDB
        for (const gEvent of googleEvents) {
            // Check if event already exists by googleEventId
            let event = await Event.findOne({ googleEventId: gEvent.id, userId: user._id });

            if (!event) {
                // Create new event
                event = new Event({
                    userId: user._id,
                    googleEventId: gEvent.id,
                    summary: gEvent.summary,
                    description: gEvent.description,
                    start: {
                        dateTime: gEvent.start.dateTime || gEvent.start.date,
                        timeZone: gEvent.start.timeZone,
                    },
                    end: {
                        dateTime: gEvent.end.dateTime || gEvent.end.date,
                        timeZone: gEvent.end.timeZone,
                    },
                });
            } else {
                // Update existing event
                event.summary = gEvent.summary;
                event.description = gEvent.description;
                event.start = {
                    dateTime: gEvent.start.dateTime || gEvent.start.date,
                    timeZone: gEvent.start.timeZone,
                };
                event.end = {
                    dateTime: gEvent.end.dateTime || gEvent.end.date,
                    timeZone: gEvent.end.timeZone,
                };
                event.updatedAt = Date.now();
            }
            await event.save();
        }

        res.status(200).json({ message: 'Calendar synced from Google successfully!', syncedCount: googleEvents.length });

    } catch (error) {
        console.error('Error syncing from Google Calendar:', error.message);
        res.status(500).json({ message: 'Failed to sync calendar from Google', error: error.message });
    }
});

// Get events from MongoDB
router.get('/events', protect, async (req, res) => {
    try {
        const user = req.user;
        const events = await Event.find({ userId: user._id }).sort('start.dateTime');
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events from DB:', error);
        res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
});

// Create an event in MongoDB and sync to Google Calendar
router.post('/events', protect, async (req, res) => {
    try {
        const user = req.user;
        const calendar = await getGoogleCalendarClient(user);
        const { summary, description, start, end } = req.body;

        // Create event in Google Calendar
        const googleEvent = {
            summary,
            description,
            start: {
                dateTime: new Date(start.dateTime).toISOString(),
                timeZone: start.timeZone || user.googleCalendarId, // Use user's primary calendar timezone or a default
            },
            end: {
                dateTime: new Date(end.dateTime).toISOString(),
                timeZone: end.timeZone || user.googleCalendarId,
            },
            // Add attendees, reminders, etc. if needed
        };

        const gCalRes = await calendar.events.insert({
            calendarId: user.googleCalendarId,
            requestBody: googleEvent,
        });

        // Save event in MongoDB with googleEventId
        const newEvent = new Event({
            userId: user._id,
            googleEventId: gCalRes.data.id,
            summary: gCalRes.data.summary,
            description: gCalRes.data.description,
            start: {
                dateTime: new Date(gCalRes.data.start.dateTime || gCalRes.data.start.date),
                timeZone: gCalRes.data.start.timeZone,
            },
            end: {
                dateTime: new Date(gCalRes.data.end.dateTime || gCalRes.data.end.date),
                timeZone: gCalRes.data.end.timeZone,
            },
        });
        await newEvent.save();

        res.status(201).json({ message: 'Event created and synced!', event: newEvent });

    } catch (error) {
        console.error('Error creating event:', error.message);
        res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
});

// Update an event in MongoDB and sync to Google Calendar
router.put('/events/:id', protect, async (req, res) => {
    try {
        const user = req.user;
        const calendar = await getGoogleCalendarClient(user);
        const { id } = req.params; // MongoDB event ID
        const { summary, description, start, end } = req.body;

        let event = await Event.findById(id);
        if (!event || event.userId.toString() !== user._id.toString()) {
            return res.status(404).json({ message: 'Event not found or not authorized' });
        }

        // Update in Google Calendar
        const googleEventUpdate = {
            summary,
            description,
            start: {
                dateTime: new Date(start.dateTime).toISOString(),
                timeZone: start.timeZone || user.googleCalendarId,
            },
            end: {
                dateTime: new Date(end.dateTime).toISOString(),
                timeZone: end.timeZone || user.googleCalendarId,
            },
        };

        await calendar.events.update({
            calendarId: user.googleCalendarId,
            eventId: event.googleEventId,
            requestBody: googleEventUpdate,
        });

        // Update in MongoDB
        event.summary = summary;
        event.description = description;
        event.start = { dateTime: new Date(start.dateTime), timeZone: start.timeZone };
        event.end = { dateTime: new Date(end.dateTime), timeZone: end.timeZone };
        event.updatedAt = Date.now();
        await event.save();

        res.status(200).json({ message: 'Event updated and synced!', event });

    } catch (error) {
        console.error('Error updating event:', error.message);
        res.status(500).json({ message: 'Failed to update event', error: error.message });
    }
});

// Delete an event from MongoDB and Google Calendar
router.delete('/events/:id', protect, async (req, res) => {
    try {
        const user = req.user;
        const calendar = await getGoogleCalendarClient(user);
        const { id } = req.params; // MongoDB event ID

        let event = await Event.findById(id);
        if (!event || event.userId.toString() !== user._id.toString()) {
            return res.status(404).json({ message: 'Event not found or not authorized' });
        }

        // Delete from Google Calendar
        await calendar.events.delete({
            calendarId: user.googleCalendarId,
            eventId: event.googleEventId,
        });

        // Delete from MongoDB
        await event.deleteOne();

        res.status(200).json({ message: 'Event deleted and synced!' });

    } catch (error) {
        console.error('Error deleting event:', error.message);
        res.status(500).json({ message: 'Failed to delete event', error: error.message });
    }
});


module.exports = router;