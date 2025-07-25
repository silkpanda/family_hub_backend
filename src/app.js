import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';

import connectDB from './config/db.js';
import initializeSocket from './services/socket.handler.js';
import './config/passport-setup.js'; // Sets up the Google strategy

// --- Route Imports ---
import authRoutes from './api/routes/auth.routes.js';
import healthCheckRoute from './api/routes/health.routes.js';
import calendarRoutes from './api/routes/calendar.routes.js';
import listRoutes from './api/routes/list.routes.js';
import choreRoutes from './api/routes/chore.routes.js';

// --- Middleware Imports ---
import errorHandler from './api/middleware/errorHandler.js';

// --- Initial Setup ---
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

// --- Core Middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// --- API Routes ---
// This section connects your route files to the main application.
app.use('/api/auth', authRoutes);
app.use('/api', healthCheckRoute); // For Render health checks
app.use('/api/calendar', calendarRoutes); // <-- This line activates the calendar routes
app.use('/api/lists', listRoutes);
app.use('/api/chores', choreRoutes);

// --- WebSocket Handler ---
initializeSocket(io);

// --- Error Handling Middleware ---
// This MUST be the last middleware loaded.
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

export { io }; // Export for use in other files, like controllers
