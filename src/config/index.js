import dotenv from 'dotenv';

// Load environment variables from .env file.
// This is especially important for local development.
// In production environments like Render, these variables are set in the dashboard.
dotenv.config();

// This configuration object centralizes access to all environment variables.
// It provides a single source of truth for configuration throughout the application,
// making it easier to manage and debug.
const config = {
  // Server configuration
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  databaseUrl: process.env.DATABASE_URL,

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET,

  // Google OAuth 2.0 configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  // Frontend client URL for CORS and redirects
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

// We perform a check to ensure critical environment variables are defined
// before the application starts. This prevents runtime errors due to
// missing configuration.
if (!config.databaseUrl) {
  console.error("FATAL ERROR: DATABASE_URL is not defined.");
  process.exit(1);
}

if (!config.jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

if (!config.google.clientId || !config.google.clientSecret) {
    console.error("FATAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not defined.");
    process.exit(1);
}


export default config;
