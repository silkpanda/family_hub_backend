import mongoose from 'mongoose';

// This function establishes the connection to the MongoDB database.
const connectDB = async () => {
  try {
    // Attempt to connect to the database using the connection string
    // from the environment variables. This is the recommended practice
    // for security and flexibility between different environments (dev, prod).
    const conn = await mongoose.connect(process.env.DATABASE_URL);

    // If the connection is successful, log a confirmation message
    // to the console, including the host it connected to.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If an error occurs during the connection attempt, log the error message.
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Exit the Node.js process with a failure code (1).
    // This is important because the application cannot function without a
    // database connection, so it should stop running.
    process.exit(1);
  }
};

export default connectDB;
