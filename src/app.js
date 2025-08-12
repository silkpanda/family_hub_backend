// --- File: /backend/src/app.js ---
// This is the main entry point for the backend server. It sets up the Express application,
// configures middleware, initializes Socket.IO, defines API routes, and starts the server.

import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
import connectDB from './config/db.js';
import initializeSocket from './services/socket.handler.js';
import './config/passport-setup.js'; // Initializes Passport.js strategies.
import authRoutes from './api/routes/auth.routes.js';
import healthCheckRoute from './api/routes/health.routes.js';
import calendarRoutes from './api/routes/calendar.routes.js';
import listRoutes from './api/routes/list.routes.js';
import choreRoutes from './api/routes/chore.routes.js';
import mealRoutes from './api/routes/meal.routes.js';
import familyRoutes from './api/routes/family.routes.js';
import storeRoutes from './api/routes/store.routes.js';
import errorHandler from './api/middleware/errorHandler.js';

// Establish connection to the MongoDB database.
connectDB();

const app = express();
const server = http.createServer(app);

// **BUG FIX:** The "CORS header missing" error indicates the global cors() middleware isn't working for Socket.IO's handshake.
// The most robust solution is to configure CORS directly within the Socket.IO server constructor.
// This ensures Socket.IO handles the necessary pre-flight requests correctly.
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  allowEIO3: true,
});

// --- Middleware Setup ---
// The global CORS middleware is removed from here to avoid conflicts.
app.use(helmet({ crossOriginOpenerPolicy: false })); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// --- API Routes ---
// We add a specific cors middleware here just for our API routes.
app.use('/api', cors(), authRoutes); // Example, you might need to adjust this
app.use('/api/auth', cors(), authRoutes);
app.use('/api', cors(), healthCheckRoute);
app.use('/api/calendar', cors(), calendarRoutes);
app.use('/api/lists', cors(), listRoutes);
app.use('/api/chores', cors(), choreRoutes);
app.use('/api/meals', cors(), mealRoutes);
app.use('/api/family', cors(), familyRoutes);
app.use('/api/store', cors(), storeRoutes);


// --- Production Build Serving ---
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
}

// Initialize Socket.IO event handlers.
initializeSocket(io);

// --- Error Handling ---
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Export the Socket.IO instance for use in other parts of the application (e.g., controllers).
export { io };
