const Household = require('../models/Household');

// Helper function to get the Socket.IO instance from the request
const getSocketIo = (req) => req.app.get('socketio');

// Get all tasks for a household
const getTasks = async (req, res) => {
    try {
        const { householdId } = req.params;
        const household = await Household.findById(householdId).populate('tasks.assignedTo', 'displayName');
        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }
        res.json(household.tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new task
const createTask = async (req, res) => {
    const { householdId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const newTask = { ...req.body };
        household.tasks.push(newTask);
        await household.save();

        const createdTask = household.tasks[household.tasks.length - 1];
        io.to(householdId).emit('task_created', createdTask);
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: 'Error creating task', error: error.message });
    }
};

// Update a task
const updateTask = async (req, res) => {
    const { householdId, taskId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const task = household.tasks.id(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        Object.assign(task, req.body);
        await household.save();

        io.to(householdId).emit('task_updated', task);
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: 'Error updating task', error: error.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    const { householdId, taskId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const task = household.tasks.id(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        task.deleteOne();
        await household.save();

        io.to(householdId).emit('task_deleted', taskId);
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};

// Mark a task as complete by a user
const completeTask = async (req, res) => {
    const { householdId, taskId } = req.params;
    const io = getSocketIo(req);
    try {
        const household = await Household.findById(householdId);
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const task = household.tasks.id(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.status = 'pending_approval';
        await household.save();
        
        io.to(householdId).emit('task_updated', task);
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Approve a completed task by a parent
const approveTaskCompletion = async (req, res) => {
    const { householdId, taskId } = req.params;
    const io = getSocketIo(req);

    try {
        const household = await Household.findById(householdId).populate('members.user');
        if (!household) return res.status(404).json({ message: 'Household not found' });

        const task = household.tasks.id(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (task.status !== 'pending_approval') {
            return res.status(400).json({ message: 'Task is not pending approval' });
        }

        task.status = 'complete';
        
        // Award points to assigned members
        task.assignedTo.forEach(userId => {
            const member = household.members.find(m => m.user._id.equals(userId));
            if (member) {
                member.user.points = (member.user.points || 0) + task.points;
                io.to(householdId).emit('points_updated', { userId: member.user._id, newPoints: member.user.points });
            }
        });
        
        await household.save();

        io.to(householdId).emit('task_updated', task);
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    approveTaskCompletion,
};

