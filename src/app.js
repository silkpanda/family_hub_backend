import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';

// --- Initial Configuration ---
// Load environment variables from .env file
dotenv.config();

// --- Local Imports ---
// Database connection
import connectDB from './config/db.js';

// Passport configuration (must be imported to run the setup)
import './config/passport-setup.js';

// Route handlers
import authRoutes from './api/routes/auth.routes.js';
import healthCheckRoute from './api/routes/health.routes.js';
import calendarRoutes from './api/routes/calendar.routes.js';
import listRoutes from './api/routes/list.routes.js';
import choreRoutes from './api/routes/chore.routes.js';
// Note: Meal and other routes can be added here once their controllers/validators are created.

// Middleware
import errorHandler from './api/middleware/errorHandler.js';

// Services
import initializeSocket from './services/socket.handler.js';

// --- Database Connection ---
connectDB();

// --- Server & Socket.io Initialization ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // Use environment variable for the client URL
    methods: ['GET', 'POST'],
  },
});

// --- Core Middleware ---
app.use(helmet()); // Set security-related HTTP response headers
app.use(cors({ origin: process.env.CLIENT_URL })); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded payloads
app.use(passport.initialize()); // Initialize Passport for authentication

// --- API Routes ---
// All API endpoints are organized here.
app.use('/api/auth', authRoutes);
app.use('/api', healthCheckRoute);
app.use('/api/calendar', calendarRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/chores', choreRoutes);

// --- Real-time Socket.io Handler ---
// This initializes the authentication and connection logic for WebSockets.
initializeSocket(io);

// --- Global Error Handling Middleware ---
// This must be the LAST middleware in the chain to catch all errors.
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Export the 'io' instance so it can be used in other files (like controllers)
// to emit real-time events.
export { io };
