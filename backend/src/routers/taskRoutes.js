const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    restoreTask,
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

// Restore deleted task
router.put('/:id/restore', restoreTask);

module.exports = router;

