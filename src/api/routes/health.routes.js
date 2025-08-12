// Defines a simple health check route to verify that the service is running.

import express from 'express';

const healthRouter = express.Router();

healthRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Backend service is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

export default healthRouter;