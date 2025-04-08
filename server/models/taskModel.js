const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema
const subtaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    dueDate: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    }
}, {timestamps: true})

const taskSchema = new Schema({
    taskTitle: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    dueDate: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    },
    priority: {
        type: Number,
        enum: [1, 2, 3],
        default: 2
    },
    listId: {
        type: Schema.Types.ObjectId,
        ref: 'List',
        required: true
    },
    subtasks: [subtaskSchema]
}, {timestamps: true})

module.exports = mongoose.model('Task', taskSchema);
