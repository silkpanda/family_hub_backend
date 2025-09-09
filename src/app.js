const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./config/db');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const householdRoutes = require('./routes/household.routes');
const invitationRoutes = require('./routes/invitation.routes');

const app = express();
const server = http.createServer(app);

// --- CORS Configuration ---
// Define the list of allowed origins (URLs that can make requests to your backend)
const whitelist = [
    process.env.CLIENT_URL || 'http://localhost:3000', // Your deployed frontend URL from .env
    'https://your-netlify-frontend-url.netlify.app' // Add your specific Netlify URL here
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

const io = new Server(server, {
    cors: corsOptions // Use the same CORS options for Socket.IO
});

app.set('socketio', io);
connectDB();

// Use the configured CORS options for all Express routes
app.use(cors(corsOptions));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'a secret key for development',
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/invitations', invitationRoutes);

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

