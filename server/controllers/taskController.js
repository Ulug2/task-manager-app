const Task = require('../models/taskModel')
const List = require('../models/listModel')
const mongoose = require('mongoose')

// GET all tasks
const getAllTasks = async (req, res) => {
    const allTasks = await Task.find({}).sort({createdAt: -1})
    if (!allTasks){
        return res.status(404).json({error: "Tasks don't exist"})
    }
    res.status(200).json(allTasks)
}

// GET single task
const getSingleTask = async(req, res) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: "No such task"})
    }

    const singleTask = await Task.findById(id)
    if (!singleTask){
        return res.status(404).json({error: "No such task"})
    }
    res.status(200).json(singleTask)
}

// Create task
const createTask = async (req, res) => {
    const {taskTitle, description, dueDate, completed, priority, listId} = req.body;
    let emptyFields = []
    if (!taskTitle) {
        emptyFields.push("Task title")
    }
    if (!listId) {
        emptyFields.push("List ID")
    }
    
    if (emptyFields.length > 0){
        return res.status(400).json({error: `Please indicate following ${emptyFields.join(",")}`})
    }

    // Validate listId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({error: "Invalid list ID"})
    }

    // add to db 
    try {
        // First check if the list exists
        const List = require('../models/listModel');
        const list = await List.findById(listId);
        
        if (!list) {
            return res.status(404).json({error: "List not found"})
        }
        
        // Create the new task
        const newTask = await Task.create({taskTitle, description, dueDate, completed, priority, listId});
        
        // Update the list with the new task ID
        list.tasks.push(newTask._id);
        await list.save();
        
        res.status(201).json(newTask)
    }
    catch (error){
        res.status(400).json({error: error.message})
    }
}

// Update task
const updateTask = async (req, res) => {
    const {id} = req.params;
    const { listId: newListId, ...otherUpdates } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: "No such task"})
    }

    try {
        // Get the current task to check if listId is changing
        const currentTask = await Task.findById(id);
        
        if (!currentTask) {
            return res.status(404).json({error: "No such task"})
        }
        
        // If listId is being updated, handle list updates
        if (newListId && newListId !== currentTask.listId.toString()) {
            // Validate new listId is valid
            if (!mongoose.Types.ObjectId.isValid(newListId)) {
                return res.status(400).json({error: "Invalid new list ID"})
            }
            
            const List = require('../models/listModel');
            
            // Check if new list exists
            const newList = await List.findById(newListId);
            if (!newList) {
                return res.status(404).json({error: "New list not found"})
            }
            
            // Remove task from old list
            await List.findByIdAndUpdate(
                currentTask.listId,
                { $pull: { tasks: id } }
            );
            
            // Add task to new list
            await List.findByIdAndUpdate(
                newListId,
                { $push: { tasks: id } }
            );
        }
        
        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
            id, 
            {...req.body}, 
            {new: true}
        )
        
        res.status(200).json(updatedTask)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// Delete task
const deleteTask = async (req, res) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: "No such task"})
    }

    try {
        const deletedTask = await Task.findById(id);
        
        if (!deletedTask) {
            return res.status(404).json({error: "No such task"})
        }
        
        // Remove the task ID from the list's tasks array
        if (deletedTask.listId) {
            const List = require('../models/listModel');
            await List.findByIdAndUpdate(
                deletedTask.listId,
                { $pull: { tasks: id } }
            );
        }
        
        // Delete the task
        await Task.findByIdAndDelete(id);
        
        res.status(200).json(deletedTask)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

/// SUBTASKS
// GET all subtasks for a specific task
const getAllSubtasks = async (req, res) => {
    const { taskId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({error: "Invalid task ID"})
    }
    
    const task = await Task.findById(taskId);
    
    if (!task) {
        return res.status(404).json({error: "Task not found"})
    }
    
    if (!task.subtasks || task.subtasks.length === 0) {
        return res.status(404).json({error: "No subtasks found for this task"})
    }
    
    res.status(200).json(task.subtasks)
}

// GET single subtask
const getSingleSubtask = async(req, res) => {
    const { taskId, subtaskId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({error: "Invalid task ID"})
    }
    
    const task = await Task.findById(taskId);
    
    if (!task) {
        return res.status(404).json({error: "Task not found"})
    }
    
    const subtask = task.subtasks.id(subtaskId);
    
    if (!subtask) {
        return res.status(404).json({error: "Subtask not found"})
    }
    
    res.status(200).json(subtask)
}

// Create subtask
const createSubtask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, dueDate, completed } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({error: "Invalid task ID"})
    }
    
    let emptyFields = []
    if (!title) {
        emptyFields.push("Title")
    }
    
    if (emptyFields.length > 0){
        return res.status(400).json({error: `Please indicate following ${emptyFields.join(",")}`})
    }

    try {
        const task = await Task.findById(taskId);
        
        if (!task) {
            return res.status(404).json({error: "Task not found"})
        }
        
        // Create new subtask and push to task's subtasks array
        task.subtasks.push({
            title,
            description,
            dueDate,
            completed: completed || false
        });
        
        await task.save();
        
        // Return the newly added subtask
        const newSubtask = task.subtasks[task.subtasks.length - 1];
        res.status(200).json(newSubtask);
    }
    catch (error){
        res.status(400).json({error: error.message})
    }
}

// Update subtask
const updateSubtask = async (req, res) => {
    const { taskId, subtaskId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({error: "Invalid task ID"})
    }
    
    try {
        const task = await Task.findById(taskId);
        
        if (!task) {
            return res.status(404).json({error: "Task not found"})
        }
        
        const subtask = task.subtasks.id(subtaskId);
        
        if (!subtask) {
            return res.status(404).json({error: "Subtask not found"})
        }
        
        // Update the subtask fields
        Object.keys(req.body).forEach(key => {
            if (key in subtask) {
                subtask[key] = req.body[key];
            }
        });
        
        await task.save();
        
        // Return the updated subtask
        res.status(200).json(subtask);
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// Delete subtask
const deleteSubtask = async (req, res) => {
    const { taskId, subtaskId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({error: "Invalid task ID"})
    }
    
    try {
        const task = await Task.findById(taskId);
        
        if (!task) {
            return res.status(404).json({error: "Task not found"})
        }
        
        const subtask = task.subtasks.id(subtaskId);
        
        if (!subtask) {
            return res.status(404).json({error: "Subtask not found"})
        }
        
        // Store subtask for response before removing
        const deletedSubtask = {...subtask.toObject()};
        
        // Remove subtask and save task
        subtask.deleteOne();
        await task.save();
        
        res.status(200).json(deletedSubtask);
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


module.exports = {
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
}