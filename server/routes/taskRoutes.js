const express = require('express');
const router = express.Router();
const {
    createTask,
    getSingleTask,
    getAllTasks,
    updateTask,
    deleteTask,
    getAllSubtasks,
    getSingleSubtask,
    createSubtask,
    updateSubtask,
    deleteSubtask
} = require('../controllers/taskController');

// Routes for tasks

// GET all tasks
router.get('/', getAllTasks);

// GET a single task
router.get('/:id', getSingleTask);

// POST a new task
router.post('/', createTask);

// PATCH update a task
router.patch('/:id', updateTask);

// DELETE a task
router.delete('/:id', deleteTask);

// Routes for subtasks (nested under tasks)

// GET all subtasks for a specific task
router.get('/:taskId/subtasks', getAllSubtasks);

// GET a single subtask from a specific task
router.get('/:taskId/subtasks/:subtaskId', getSingleSubtask);

// POST a new subtask to a specific task
router.post('/:taskId/subtasks', createSubtask);

// PATCH update a subtask in a specific task
router.patch('/:taskId/subtasks/:subtaskId', updateSubtask);

// DELETE a subtask from a specific task
router.delete('/:taskId/subtasks/:subtaskId', deleteSubtask);

// Export the router
module.exports = router;