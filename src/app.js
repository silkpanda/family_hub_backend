import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';

import connectDB from './config/db.js';
import initializeSocket from './services/socket.handler.js';
import './config/passport-setup.js'; // Important: This sets up the Google strategy

// Import routes
import authRoutes from './api/routes/auth.routes.js';
import healthCheckRoute from './api/routes/health.routes.js'; // For Render health checks
import calendarRoutes from './api/routes/calendar.routes.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', healthCheckRoute);
app.use('/api/calendar', calendarRoutes);

// TODO: Add other routes (lists, etc.) here

// Initialize WebSocket handler
initializeSocket(io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io }; // Export for use in other files