import { google } from 'googleapis';
import User from '../models/user.model.js';
import Event from '../models/event.model.js';
import { io } from '../app.js';

// This service is the heart of the 2-way sync
class CalendarSyncService {
  constructor(user) {
    this.user = user;
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Sync from our app TO Google Calendar
  async createExternalEvent(eventData) {
    // 1. Create event in Google Calendar
    const externalEvent = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: eventData.title,
        description: eventData.description,
        start: { dateTime: eventData.startTime, timeZone: 'America/Chicago' },
        end: { dateTime: eventData.endTime, timeZone: 'America/Chicago' },
      },
    });

    // 2. Save the Google-generated event ID to our database for future mapping
    await Event.findByIdAndUpdate(eventData.id, {
      externalCalendarId: externalEvent.data.id,
    });

    console.log('Event created on Google Calendar');
  }

  // This is the "pull" method, run periodically or on-demand
  async syncFromExternalCalendar() {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const externalEvents = response.data.items;

    for (const extEvent of externalEvents) {
      const existingEvent = await Event.findOne({ externalCalendarId: extEvent.id });

      if (!existingEvent) {
        // Event exists in Google but not in our app - create it
        const newEvent = await Event.create({
          // ... map fields from extEvent to our Event model
        });
        // Notify clients in real-time
        io.to(this.user.familyId).emit('newEvent', newEvent);
      } else {
        // Event exists in both - check if it needs updating
        // ... comparison logic here
      }
    }
  }

  // This sets up the "push" method from Google
  async setupWebhook() {
    // This is an advanced feature. It involves creating a publicly accessible
    // endpoint in our app that Google can POST to when a calendar changes.
    // It's more efficient than polling.
    // await this.calendar.events.watch({ ... });
    console.log('Webhook setup is a next-step implementation.');
  }
}

export default CalendarSyncService;