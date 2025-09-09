// Load environment variables from .env file right at the start
const dotenv = require('dotenv');
dotenv.config();

// Import the configured server instance from app.js
const { server } = require('./src/app');

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
// All setup (DB connection, Socket.IO, etc.) is now handled in app.js
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

