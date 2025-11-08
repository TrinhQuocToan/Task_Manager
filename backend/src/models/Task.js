const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category ID is required']
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title must not exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Not Started'
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    reminderAt: {
        type: Date,
        default: null
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ categoryId: 1 });
taskSchema.index({ reminderAt: 1, reminderSent: 1 });
taskSchema.index({ userId: 1, deleted: 1 });

// Query helper để exclude deleted items by default
taskSchema.pre(/^find/, function(next) {
    // Chỉ filter deleted nếu không có query.deleted
    if (this.getQuery().deleted === undefined) {
        this.where({ deleted: false });
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema, 'tasks');

