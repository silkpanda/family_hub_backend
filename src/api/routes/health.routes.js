import express from 'express';

const router = express.Router();

// @desc    Health check endpoint for the service
// @route   GET /api/health
// @access  Public
// This route is used by hosting providers like Render to confirm the application is live.
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Backend service is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

export default router;
