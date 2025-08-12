// --- File: /backend/src/services/socket.handler.js ---
// This file initializes and handles all Socket.IO server-side events.

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        // **DEBUGGING:** Log when a new client connects.
        console.log(`[Socket.IO Server] A user connected successfully: ${socket.id}`);

        // 'joinFamily' event: Allows a client to join a room specific to their family.
        socket.on('joinFamily', (familyId) => {
            console.log(`[Socket.IO Server] Socket ${socket.id} is joining family room: ${familyId}`);
            socket.join(familyId);
        });

        // **DEBUGGING:** Listen for the disconnect event and, most importantly, log the reason.
        // The 'reason' will tell us why the server is closing the connection.
        socket.on('disconnect', (reason) => {
            console.error(`[Socket.IO Server] User disconnected: ${socket.id}. Reason: ${reason}`);
        });

        socket.on('error', (err) => {
            console.error('[Socket.IO Server] A socket error occurred:', err.message);
        });
    });
};

export default initializeSocket;
