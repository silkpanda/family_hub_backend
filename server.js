// FILE: /server.js (Project Root - The main entry point)
const http = require('http');
const dotenv = require('dotenv');
// --- Environment Variable Setup ---
dotenv.config();
const connectDB = require('./src/config/db');
const app = require('./src/app'); // Import the configured Express app
const { Server } = require("socket.io");




// --- Database Connection ---
connectDB();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

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

// Make socket.io instance available to the rest of the app
app.set('socketio', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));