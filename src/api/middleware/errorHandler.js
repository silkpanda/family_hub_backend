// ===================================================================================
// File: /backend/src/api/middleware/errorHandler.js
// ===================================================================================
const errorHandler = (err, req, res, next) => {
  console.error(err);
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = [];


  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found`;
  }
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${field}'.`;
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed. Please check your input.';
    errors = Object.values(err.errors).map(val => ({ field: val.path, message: val.message }));
  }


  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    errors: errors.length > 0 ? errors : undefined,
  });
};
export default errorHandler;
