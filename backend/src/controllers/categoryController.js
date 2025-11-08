const mongoose = require('mongoose');
const Category = require('../models/Category');

// @desc    Get all categories for current user
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
    try {
        const userId = req.userId;
        const categories = await Category.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                categories,
                count: categories.length
            }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: { category }
        });
    } catch (error) {
        console.error('Get category error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
    try {
        const { name, color, icon } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if category with same name already exists for this user
        const existingCategory = await Category.findOne({
            userId,
            name: name.trim()
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Create category
        const category = await Category.create({
            userId,
            name: name.trim(),
            color: color || '#198754',
            icon: icon || 'fa-tag'
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { category }
        });
    } catch (error) {
        console.error('Create category error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during category creation'
        });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res) => {
    try {
        const { name, color, icon } = req.body;
        const userId = req.userId;

        let category = await Category.findOne({
            _id: req.params.id,
            userId: userId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if new name conflicts with existing category
        if (name && name.trim() !== category.name) {
            const existingCategory = await Category.findOne({
                userId,
                name: name.trim(),
                _id: { $ne: req.params.id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        // Update fields
        if (name !== undefined) category.name = name.trim();
        if (color !== undefined) category.color = color;
        if (icon !== undefined) category.icon = icon;

        await category.save();

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: { category }
        });
    } catch (error) {
        console.error('Update category error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
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
            message: 'Server error during category update'
        });
    }
};

// @desc    Delete category (soft delete)
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Soft delete: mark as deleted
        category.deleted = true;
        category.deletedAt = new Date();
        await category.save();

        res.json({
            success: true,
            message: 'Category deleted successfully',
            data: {}
        });
    } catch (error) {
        console.error('Delete category error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during category deletion'
        });
    }
};

// @desc    Restore deleted category
// @route   PUT /api/categories/:id/restore
// @access  Private
exports.restoreCategory = async (req, res) => {
    try {
        // Explicitly allow finding deleted categories
        const category = await Category.findOne({
            _id: req.params.id,
            userId: req.userId,
            deleted: true
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Deleted category not found'
            });
        }

        // Restore category
        category.deleted = false;
        category.deletedAt = null;
        await category.save();

        res.json({
            success: true,
            message: 'Category restored successfully',
            data: { category }
        });
    } catch (error) {
        console.error('Restore category error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during category restoration'
        });
    }
};

// @desc    Get statistics for a specific category with optional date range
// @route   GET /api/categories/:id/statistics?startDate=xxx&endDate=xxx
// @access  Private
exports.getCategoryStatistics = async (req, res) => {
    const Task = require('../models/Task');
    
    try {
        const { startDate, endDate } = req.query;
        const categoryId = req.params.id;
        const userId = req.userId;

        // Verify category exists and belongs to user
        const category = await Category.findOne({
            _id: categoryId,
            userId: userId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Build match query
        const matchQuery = {
            userId: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId,
            categoryId: new mongoose.Types.ObjectId(categoryId)
        };

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

        // Get statistics using aggregation
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
                    mediumPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'Medium'] }, 1, 0] }
                    },
                    lowPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'Low'] }, 1, 0] }
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ['$dueDate', new Date()] },
                                        { $ne: ['$status', 'Completed'] },
                                        { $ne: ['$status', 'Cancelled'] },
                                        { $ne: ['$deleted', true] }
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
            mediumPriorityTasks: 0,
            lowPriorityTasks: 0,
            overdueTasks: 0,
            deletedTasks: 0
        };

        // Calculate completion rate
        result.completionRate = result.totalTasks > 0 
            ? Math.round((result.completedTasks / result.totalTasks) * 100) 
            : 0;

        res.json({
            success: true,
            data: {
                category: {
                    id: category._id,
                    name: category.name,
                    color: category.color,
                    icon: category.icon
                },
                dateRange: {
                    startDate: startDate || null,
                    endDate: endDate || null
                },
                statistics: result
            }
        });
    } catch (error) {
        console.error('Get category statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get comparative statistics across all categories
// @route   GET /api/categories/statistics/compare?startDate=xxx&endDate=xxx
// @access  Private
exports.compareCategories = async (req, res) => {
    const Task = require('../models/Task');
    
    try {
        const { startDate, endDate } = req.query;
        const userId = req.userId;
        const userIdObject = typeof userId === 'string' 
            ? new mongoose.Types.ObjectId(userId) 
            : userId;

        // Build match query for tasks
        const matchQuery = { userId: userIdObject };

        // Add date range filter if provided
        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) {
                matchQuery.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                matchQuery.createdAt.$lte = endDateTime;
            }
        }

        // Get statistics grouped by category
        const categoryStats = await Task.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$categoryId',
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
                                        { $ne: ['$deleted', true] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $project: {
                    _id: 0,
                    categoryId: '$_id',
                    categoryName: '$category.name',
                    categoryColor: '$category.color',
                    categoryIcon: '$category.icon',
                    totalTasks: 1,
                    completedTasks: 1,
                    inProgressTasks: 1,
                    notStartedTasks: 1,
                    cancelledTasks: 1,
                    highPriorityTasks: 1,
                    overdueTasks: 1,
                    completionRate: {
                        $cond: [
                            { $eq: ['$totalTasks', 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 0] }
                        ]
                    }
                }
            },
            { $sort: { totalTasks: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                dateRange: {
                    startDate: startDate || null,
                    endDate: endDate || null
                },
                categories: categoryStats,
                totalCategories: categoryStats.length
            }
        });
    } catch (error) {
        console.error('Compare categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Helper function to check if category exists and belongs to user
// @access  Private
exports.checkCategoryExists = async (categoryId, userId) => {
    try {
        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return {
                exists: false,
                message: 'Invalid category ID format'
            };
        }

        // Convert userId to ObjectId if it's a string
        const userIdObject = typeof userId === 'string' 
            ? new mongoose.Types.ObjectId(userId) 
            : userId;

        const category = await Category.findOne({
            _id: new mongoose.Types.ObjectId(categoryId),
            userId: userIdObject
        });
        
        if (!category) {
            // Additional check: see if category exists but belongs to different user
            const anyCategory = await Category.findById(categoryId);
            if (anyCategory) {
                return {
                    exists: false,
                    message: `Category not found or does not belong to you. This category belongs to user ${anyCategory.userId.toString()}, but you are user ${userIdObject.toString()}. Please use a category that belongs to your account or create a new one.`
                };
            }
            
            return {
                exists: false,
                message: 'Category not found'
            };
        }

        return {
            exists: true,
            category: category
        };
    } catch (error) {
        console.error('Check category error:', error);
        return {
            exists: false,
            message: 'Error checking category: ' + error.message
        };
    }
};

