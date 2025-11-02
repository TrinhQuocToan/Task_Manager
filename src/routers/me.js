const express = require('express');
const router = express.Router();

const meController = require('../app/controllers/MeController');
const profileController = require('../app/controllers/ProfileController.js');
const authMiddleware = require('../app/middleware/authMiddleware');

// Áp dụng middleware xác thực cho tất cả routes
router.use(authMiddleware.requireAuth);

router.get('/stored/courses', meController.storedCourses);
router.get('/trash/courses', meController.trashCourses);
router.get('/profile', meController.profile);
router.put('/profile', meController.updateProfile);

module.exports = router;
