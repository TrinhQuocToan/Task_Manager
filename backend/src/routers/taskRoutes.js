const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskStatistics
} = require('../controllers/taskController');

const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// Statistics route
router.get('/statistics', getTaskStatistics);

// CRUD routes
router.route('/')
    .get(getTasks)
    .post(createTask);

router.route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;

