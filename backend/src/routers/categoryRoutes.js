const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    getCategoryStatistics,
    compareCategories
} = require('../controllers/categoryController');

const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// Statistics routes (must be before /:id routes)
router.get('/statistics/compare', compareCategories);

// CRUD routes
router.route('/')
    .get(getCategories)
    .post(createCategory);

router.route('/:id')
    .get(getCategory)
    .put(updateCategory)
    .delete(deleteCategory);

// Restore deleted category
router.put('/:id/restore', restoreCategory);

// Category statistics with optional date range
router.get('/:id/statistics', getCategoryStatistics);

module.exports = router;

