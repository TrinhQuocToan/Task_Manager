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

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({
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

