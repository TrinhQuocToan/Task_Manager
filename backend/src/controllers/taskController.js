const mongoose = require('mongoose');
const Task = require('../models/Task');
const Category = require('../models/Category');
const { checkCategoryExists } = require('./categoryController');

// @desc    Get all tasks for current user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
    try {
        const { status, categoryId, priority, search, sortBy = 'dueDate', sortOrder = 'asc', startDate, endDate } = req.query;
        const userId = req.userId;

        // Build query
        const query = { userId };
        if (status) query.status = status;
        if (categoryId) query.categoryId = categoryId;
        if (priority) query.priority = priority;

        // Add date range filter if provided
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endDateTime;
            }
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        let tasks = await Task.find(query)
            .populate('categoryId', 'name color icon')
            .sort(sort)
            .lean();

        // Apply search filter if provided
        if (search && search.trim()) {
            const searchTerm = search.trim().toLowerCase();
            tasks = tasks.filter(task => {
                const titleMatch = task.title?.toLowerCase().includes(searchTerm);
                const descMatch = task.description?.toLowerCase().includes(searchTerm);
                const categoryMatch = task.categoryId?.name?.toLowerCase().includes(searchTerm);
                return titleMatch || descMatch || categoryMatch;
            });
        }

        res.json({
            success: true,
            data: {
                tasks,
                count: tasks.length
            }
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.userId
        }).populate('categoryId', 'name color icon');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: { task }
        });
    } catch (error) {
        console.error('Get task error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
    try {
        // Check if req.body exists
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Request body is missing or invalid'
            });
        }

        const { title, description, categoryId, priority, status, dueDate, reminderAt } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        if (!dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Due date is required'
            });
        }

        // Validate categoryId format
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID format'
            });
        }

        // Check if category exists and belongs to user
        const categoryCheck = await checkCategoryExists(categoryId, userId);
        
        if (!categoryCheck.exists) {
            return res.status(404).json({
                success: false,
                message: categoryCheck.message || 'Category not found'
            });
        }

        // Create task
        const task = await Task.create({
            userId,
            categoryId,
            title,
            description: description || '',
            priority: priority || 'Medium',
            status: status || 'Not Started',
            dueDate: new Date(dueDate),
            reminderAt: reminderAt ? new Date(reminderAt) : null
        });

        await task.populate('categoryId', 'name color icon');

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task }
        });
    } catch (error) {
        console.error('Create task error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during task creation'
        });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
    try {
        const { title, description, categoryId, priority, status, dueDate, reminderAt } = req.body;
        const userId = req.userId;

        let task = await Task.findOne({
            _id: req.params.id,
            userId: userId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Update fields
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority !== undefined) task.priority = priority;
        if (status !== undefined) task.status = status;
        if (dueDate !== undefined) task.dueDate = new Date(dueDate);
        if (reminderAt !== undefined) task.reminderAt = reminderAt ? new Date(reminderAt) : null;

        // Verify category if changed
        if (categoryId && categoryId !== task.categoryId.toString()) {
            // Validate categoryId format
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID format'
                });
            }

            // Check if category exists and belongs to user
            const categoryCheck = await checkCategoryExists(categoryId, userId);
            
            if (!categoryCheck.exists) {
                return res.status(404).json({
                    success: false,
                    message: categoryCheck.message || 'Category not found'
                });
            }

            task.categoryId = categoryId;
        }

        await task.save();
        await task.populate('categoryId', 'name color icon');

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: { task }
        });
    } catch (error) {
        console.error('Update task error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during task update'
        });
    }
};

// @desc    Delete task (soft delete)
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Soft delete: mark as deleted
        task.deleted = true;
        task.deletedAt = new Date();
        await task.save();

        res.json({
            success: true,
            message: 'Task deleted successfully',
            data: {}
        });
    } catch (error) {
        console.error('Delete task error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during task deletion'
        });
    }
};

// @desc    Restore deleted task
// @route   PUT /api/tasks/:id/restore
// @access  Private
exports.restoreTask = async (req, res) => {
    try {
        // Explicitly allow finding deleted tasks
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.userId,
            deleted: true
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Deleted task not found'
            });
        }

        // Restore task
        task.deleted = false;
        task.deletedAt = null;
        await task.save();

        await task.populate('categoryId', 'name color icon');

        res.json({
            success: true,
            message: 'Task restored successfully',
            data: { task }
        });
    } catch (error) {
        console.error('Restore task error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during task restoration'
        });
    }
};

// @desc    Get task statistics
// @route   GET /api/tasks/statistics?categoryId=xxx&startDate=xxx&endDate=xxx
// @access  Private
exports.getTaskStatistics = async (req, res) => {
    try {
        const userId = req.userId;
        const { categoryId, startDate, endDate } = req.query;

        // Convert userId to ObjectId if it's a string
        const userIdObject = typeof userId === 'string' 
            ? new mongoose.Types.ObjectId(userId) 
            : userId;

        // Build match query
        const matchQuery = { userId: userIdObject };

        // Add category filter if provided
        if (categoryId) {
            matchQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
        }

        // Add date range filter if provided
        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) {
                matchQuery.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999); // Include entire end date
                matchQuery.createdAt.$lte = endDateTime;
            }
        }

        // Include all tasks (even deleted ones) for accurate statistics
        const stats = await Task.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    inProgressTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
                    },
                    notStartedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'Not Started'] }, 1, 0] }
                    },
                    cancelledTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
                    },
                    highPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] }
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ['$dueDate', new Date()] },
                                        { $ne: ['$status', 'Completed'] },
                                        { $ne: ['$status', 'Cancelled'] },
                                        { $ne: ['$deleted', true] } // Exclude deleted from overdue
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    deletedTasks: {
                        $sum: { $cond: [{ $eq: ['$deleted', true] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            notStartedTasks: 0,
            cancelledTasks: 0,
            highPriorityTasks: 0,
            overdueTasks: 0,
            deletedTasks: 0
        };

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get task statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

