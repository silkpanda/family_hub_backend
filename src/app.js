// ===================================================================================
// File: /backend/src/app.js
// Final, correct version with BOTH CORS configurations.
// ===================================================================================
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';

import connectDB from './config/db.js';
import initializeSocket from './services/socket.handler.js';
import './config/passport-setup.js';

import authRoutes from './api/routes/auth.routes.js';
import healthCheckRoute from './api/routes/health.routes.js';
import calendarRoutes from './api/routes/calendar.routes.js';
import listRoutes from './api/routes/list.routes.js';
import choreRoutes from './api/routes/chore.routes.js';
import mealRoutes from './api/routes/meal.routes.js';
import familyRoutes from './api/routes/family.routes.js';
import errorHandler from './api/middleware/errorHandler.js';

connectDB();

const app = express();
const server = http.createServer(app);

// CORS Configuration for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// --- Core Middleware ---
app.use(helmet({ crossOriginOpenerPolicy: false }));

// --- THIS LINE IS RESTORED ---
// CORS Middleware for all Express API routes
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api', healthCheckRoute);
app.use('/api/calendar', calendarRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/chores', choreRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/family', familyRoutes);

// --- Serve Frontend Static Files (for production) ---
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
}

initializeSocket(io);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

export { io };