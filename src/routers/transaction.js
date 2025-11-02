const express = require('express');
const router = express.Router();
const transactionController = require('../app/controllers/TransactionController');
const { requireAuth } = require('../app/middleware/authMiddleware');
const homeController = require('../app/controllers/HomeController');

router.use(requireAuth);

router.get('/create', transactionController.create);
router.post('/store', transactionController.store);
router.get('/edit/:id', transactionController.edit);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.destroy);
router.get('/', transactionController.index);
router.post('/api/transactions', homeController.quickAddTransaction);

module.exports = router;
