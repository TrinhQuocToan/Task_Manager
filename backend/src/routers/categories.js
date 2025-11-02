const express = require('express');
const router = express.Router();
const categoryController = require('../app/controllers/CategoryController');
const { requireAuth } = require('../app/middleware/authMiddleware');

// Apply requireAuth middleware to all routes
router.use(requireAuth);

// Hiển thị form tạo mới
router.get('/create', categoryController.create);

// Xử lý tạo mới
router.post('/store', categoryController.store);

// Hiển thị form edit
router.get('/:id/edit', categoryController.edit);

// Xử lý cập nhật
router.put('/:id', categoryController.update);

// Xử lý xóa
router.delete('/:id', categoryController.delete);

// Hiển thị danh sách
router.get('/', categoryController.index);

module.exports = router;