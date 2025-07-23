
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import config from '../config/index.js';

const initializeSocket = (io) => {
  // --- Socket.io Authentication Middleware ---
  // This middleware runs for every incoming connection.
  // It verifies the JWT sent by the client before establishing a persistent connection.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided.'));
      }

      // Verify the token using the same secret as your API
      const decoded = jwt.verify(token, config.jwtSecret);

      // Find the user associated with the token
      const user = await User.findById(decoded.id).select('displayName familyId');

      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }
      
      if (!user.familyId) {
        return next(new Error('Connection error: User does not belong to a family.'));
      }

      // Attach user information to the socket object for use in other event handlers
      socket.user = user;
      next(); // Authentication successful, proceed with the connection
    } catch (error) {
      // Handle invalid tokens or other verification errors
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token.'));
    }
  });


  // --- Main Connection Handler ---
  // This function runs after a client has been successfully authenticated by the middleware.
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.displayName} (Socket ID: ${socket.id})`);

    // Join a room specific to the user's family.
    // This is the key to broadcasting messages to the correct group of users.
    const familyRoom = socket.user.familyId.toString();
    socket.join(familyRoom);
    console.log(`   ↳ Joined family room: ${familyRoom}`);

    // --- Event Listeners for this Socket ---
    // You can add listeners for specific client-sent events here.
    // For example, a typing indicator for the chat module:
    // socket.on('typing', (data) => {
    //   socket.to(familyRoom).emit('user_typing', { user: socket.user.displayName });
    // });


    // --- Disconnect Handler ---
    // This runs when a client disconnects from the server.
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.displayName} (Socket ID: ${socket.id})`);
    });
  });
};

export default initializeSocket;
