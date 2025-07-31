// ===================================================================================
// File: /backend/src/api/routes/health.routes.js
// ===================================================================================
import express from 'express';
const healthRouter = express.Router();
healthRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Backend service is running smoothly.', timestamp: new Date().toISOString() });
});
export default healthRouter;
