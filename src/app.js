const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./config/db');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Initialize Passport configuration
require('./config/passport');

// Import route files
const authRoutes = require('./routes/auth.routes');
const householdRoutes = require('./routes/household.routes');
const invitationRoutes = require('./routes/invitation.routes');
const calendarRoutes = require('./routes/calendar.routes');
const mealPlannerRoutes = require('./routes/mealPlanner.routes');
const taskRoutes = require('./routes/task.routes');
const rewardRoutes = require('./routes/reward.routes');


const app = express();
const server = http.createServer(app);

// --- Connect to Database ---
connectDB();

// --- Production Proxy Configuration ---
// This is crucial. It tells Express to trust the headers sent by Render's proxy.
app.set('trust proxy', 1);

// --- CORS Configuration ---
console.log(`CORS is configured to allow requests from: ${process.env.CLIENT_URL}`);
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));

// --- Socket.IO Setup ---
const io = new Server(server, {
    cors: corsOptions
});
app.set('socketio', io);


// --- Middleware ---
app.use(express.json());

// --- Session Configuration (Production Ready) ---
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.DATABASE_URL,
        }),
        cookie: {
            secure: true,      // Essential for HTTPS
            httpOnly: true,
            sameSite: 'none',  // The KEY setting for cross-domain cookies
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
    })
);

// --- Passport Initialization ---
app.use(passport.initialize());
app.use(passport.session());

// --- Request Logger ---
app.use((req, res, next) => {
    const userStatus = req.user ? `User: ${req.user.id}` : 'No User Session';
    console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl} - (${userStatus})`);
    next();
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/meal-planner', mealPlannerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/rewards', rewardRoutes);


// --- WebSocket Connection Handling ---
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

