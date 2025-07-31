// ===================================================================================
// File: /backend/src/services/socket.handler.js
// Purpose: Defines how the WebSocket server handles events from connected clients.
// ===================================================================================
const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('[Socket.IO Server] A user connected:', socket.id);

        // This listener allows a client to join a private room based on their family ID.
        // This is crucial for ensuring real-time updates are only sent to members
        // of the correct family.
        socket.on('joinFamily', (familyId) => {
            // Log the family ID being joined
            console.log(`[Socket.IO Server] Socket ${socket.id} attempting to join family room: ${familyId}`);
            socket.join(familyId);
            console.log(`[Socket.IO Server] Socket ${socket.id} successfully joined family room ${familyId}`);
        });

        socket.on('disconnect', () => {
            console.log('[Socket.IO Server] User disconnected:', socket.id);
        });

        socket.on('error', (err) => {
            console.error('[Socket.IO Server] Socket error:', err.message);
        });
    });
};
export default initializeSocket;