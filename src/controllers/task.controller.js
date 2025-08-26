// FILE: /src/controllers/task.controller.js
const Task = require('../models/Task');
const User = require('../models/User');

exports.getAllTasks = async (req, res) => { /* ... */ };
exports.createTask = async (req, res) => { /* ... */ };
exports.updateTask = async (req, res) => { /* ... */ };
exports.deleteTask = async (req, res) => { /* ... */ };
exports.approveTask = async (req, res) => { /* ... */ };

exports.completeTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);

        // Ensure task exists and is incomplete
        if (!task || task.status !== 'incomplete') {
            return res.status(400).json({ message: 'Task cannot be completed.' });
        }

        // Ensure the logged-in user is assigned to this task
        // Note: req.user is the authenticated user from the JWT token
        const isAssigned = task.assignedTo.some(assigneeId => assigneeId.equals(req.user._id));
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not assigned to this task.' });
        }

        task.status = 'pending_approval';
        await task.save();

        const updatedTask = await Task.findById(taskId).populate('assignedTo', 'displayName image');
        req.app.get('socketio').to(req.params.householdId).emit('task_updated', updatedTask);
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server Error completing task' });
    }
};