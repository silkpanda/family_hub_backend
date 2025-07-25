import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';

import connectDB from './config/db.js';
import initializeSocket from './services/socket.handler.js';
import './config/passport-setup.js';

// --- Route Imports ---
import authRoutes from './api/routes/auth.routes.js';
import healthCheckRoute from './api/routes/health.routes.js';
import calendarRoutes from './api/routes/calendar.routes.js';
import listRoutes from './api/routes/list.routes.js';
import choreRoutes from './api/routes/chore.routes.js';
import mealRoutes from './api/routes/meal.routes.js'; // <-- Import meal routes

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
app.use('/api/auth', authRoutes);
app.use('/api', healthCheckRoute);
app.use('/api/calendar', calendarRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/chores', choreRoutes);
app.use('/api/meals', mealRoutes); // <-- Use meal routes

// --- WebSocket Handler ---
initializeSocket(io);

// --- Error Handling Middleware ---
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

export { io };
