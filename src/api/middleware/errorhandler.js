// A comprehensive error handling middleware for Express.
// This should be the last middleware added to your app.

const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes.
  // In a production app, you'd want to use a more robust logger like Winston or Pino.
  console.error(err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = [];

  // Mongoose Bad ObjectId (e.g., an ID that is not correctly formatted)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404; // Not Found
    message = `Resource not found with id of ${err.value}`;
  }

  // Mongoose Duplicate Key Error (e.g., unique field like email already exists)
  if (err.code === 11000) {
    statusCode = 400; // Bad Request
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${field}'. Please use another value.`;
  }

  // Mongoose Validation Error (e.g., a required field is missing)
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    message = 'Validation failed. Please check your input.';
    errors = Object.values(err.errors).map(val => ({
        field: val.path,
        message: val.message
    }));
  }

  res.status(statusCode).json({
    message,
    // Provide the stack trace only in development mode for security reasons.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    // Provide specific validation errors if they exist
    errors: errors.length > 0 ? errors : undefined,
  });
};

export default errorHandler;

