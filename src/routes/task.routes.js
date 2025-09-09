const express = require('express');
const taskController = require('../controllers/task.controller');
const router = express.Router({ mergeParams: true });

// GET all tasks for a household
router.get('/', taskController.getTasks);

// POST a new task
router.post('/', taskController.createTask);

// PUT to update a specific task
router.put('/:taskId', taskController.updateTask);

// DELETE a specific task
router.delete('/:taskId', taskController.deleteTask);

// POST to mark a task as complete
router.post('/:taskId/complete', taskController.completeTask);

// POST to approve a task's completion
router.post('/:taskId/approve', taskController.approveTaskCompletion);

module.exports = router;

