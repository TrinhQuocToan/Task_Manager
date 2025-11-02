const express = require('express');
const router = express.Router();
const statisticsController = require('../app/controllers/statistics');
const { requireAuth } = require('../app/middleware/authMiddleware');

// Áp dụng middleware xác thực cho tất cả routes
router.use(requireAuth);

// Route cho trang thống kê
router.get('/', statisticsController.index);

module.exports = router;
