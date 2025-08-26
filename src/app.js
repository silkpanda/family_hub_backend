
// FILE: /src/app.js (Main Express App Configuration)
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

// --- Route Imports ---
const authRoutes = require('./routes/auth.routes');
const householdRoutes = require('./routes/household.routes');
const memberRoutes = require('./routes/member.routes');
const taskRoutes = require('./routes/task.routes');
const invitationRoutes = require('./routes/invitation.routes'); // <-- ADDED
const calendarRoutes = require('./routes/calendar.routes'); // <-- ADDED

// --- Passport Configuration ---
require('./config/passport')(passport);

const app = express();

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/households', memberRoutes);
app.use('/api/households', taskRoutes);
app.use('/api/invitations', invitationRoutes); // <-- ADDED
app.use('/api/calendar', calendarRoutes); // <-- ADDED

module.exports = app;