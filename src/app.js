import dotenv from 'dotenv';
// Load environment variables from .env file at the very beginning
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';

import connectDB from './config/db.js';
import initializeSocket from './services/socket.handler.js';
// Now that dotenv has run, this import will have access to process.env
import './config/passport-setup.js'; 

// Import routes
import authRoutes from './api/routes/auth.routes.js';
import healthCheckRoute from './api/routes/health.routes.js';
import calendarRoutes from './api/routes/calendar.routes.js';

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

// Initialize WebSocket handler
initializeSocket(io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io }; // Export for use in other files
