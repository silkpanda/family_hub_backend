// A centralized error handling middleware for the Express application.

const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes.

  // Determine the status code. Default to 500 if it's a server error.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = [];

  // Handle specific Mongoose errors for more user-friendly messages.
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found`;
  }
  if (err.code === 11000) { // Duplicate key error
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${field}'.`;
  }
  if (err.name === 'ValidationError') { // Mongoose validation error
    statusCode = 400;
    message = 'Validation failed. Please check your input.';
    errors = Object.values(err.errors).map(val => ({ field: val.path, message: val.message }));
  }

  // Send the final error response.
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Only show stack in development.
    errors: errors.length > 0 ? errors : undefined,
  });
};

export default errorHandler;
