// FILE: /src/routes/task.routes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { protect, isHouseholdMember } = require('../middleware/auth.middleware');

router.get('/:householdId/tasks', protect, isHouseholdMember, taskController.getAllTasks);
router.post('/:householdId/tasks', protect, isHouseholdMember, taskController.createTask);
router.put('/:householdId/tasks/:taskId', protect, isHouseholdMember, taskController.updateTask);
router.delete('/:householdId/tasks/:taskId', protect, isHouseholdMember, taskController.deleteTask);
router.post('/:householdId/tasks/:taskId/approve', protect, isHouseholdMember, taskController.approveTask);
router.post('/:householdId/tasks/:taskId/complete', protect, isHouseholdMember, taskController.completeTask); // <-- NEW ROUTE

module.exports = router;