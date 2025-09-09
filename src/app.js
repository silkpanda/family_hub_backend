const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./config/db');
const cors = require('cors');
const passport = require('passport'); // Import passport
const session = require('express-session'); // Import express-session

// --- Import Passport Config ---
// This line executes the passport configuration file.
require('./config/passport');

// --- Route Imports ---
const authRoutes = require('./routes/auth.routes');
const householdRoutes = require('./routes/household.routes');
const invitationRoutes = require('./routes/invitation.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.set('socketio', io);
connectDB();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Session Middleware for Passport ---
// This must come BEFORE the Passport middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'a secret key for development', // Use an environment variable in production
        resave: false,
        saveUninitialized: false,
    })
);

// --- Passport Middleware ---
// Initialize passport and have it use sessions
app.use(passport.initialize());
app.use(passport.session()); // This allows passport to use the session to store user data

// --- Request Logger Middleware ---
app.use((req, res, next) => {
    console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl}`);
    next();
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/invitations', invitationRoutes);

// --- WebSocket Connection ---
io.on('connection', (socket) => {
    console.log('A user connected via WebSocket');
    socket.on('joinHouseholdRoom', (householdId) => {
        socket.join(householdId);
        console.log(`Socket ${socket.id} joined room ${householdId}`);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

module.exports = { app, server, io };

