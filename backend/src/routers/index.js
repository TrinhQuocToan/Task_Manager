const meRouter = require('./me');
const authRouter = require('./auth');
const categoryRouter = require('./categories');
const transactionRouter = require('./transaction');
const statisticsRouter = require('./statistics');
const homeController = require('../app/controllers/HomeController');

const { checkUser, requireAuth } = require('../app/middleware/authMiddleware');

function router(app) {
    // Apply checkUser middleware to all routes
    app.use('*',checkUser);

    app.use('/auth', authRouter);
    
    // Sửa root route handler để sử dụng HomeController
    app.get('/', homeController.index);
    
    // Protect these routes
    app.use('/me', requireAuth, meRouter);
    app.use('/categories', requireAuth, categoryRouter);
    app.use('/transactions', requireAuth, transactionRouter);
    app.use('/statistics', requireAuth, statisticsRouter);

    app.get('/privacy-policy', (req, res) => {
        res.render('legal/privacy-policy');
    });

    app.get('/terms-of-service', (req, res) => {
        res.render('legal/terms-of-service');
    });

    // Xóa hoặc comment các route trùng lặp
    // app.get('/transactions', (req, res) => {
    //     res.render('transactions', {
    //         transactions: [],
    //         categories: []
    //     });
    // });
    
    // app.get('/statistics', (req, res) => {
    //     res.render('statistics', {
    //         totalIncome: 0,
    //         totalExpense: 0,
    //         balance: 0,
    //         categoryLabels: [],
    //         categoryData: [],
    //         timeLabels: [],
    //         incomeData: [],
    //         expenseData: []
    //     });
    // });
}

module.exports = router;
