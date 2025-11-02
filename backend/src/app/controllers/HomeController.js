const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = mongoose.Types.ObjectId;

class HomeController {
    // [GET] /
    async index(req, res) {
        try {
            // Kiểm tra cả req.user và req.session.user
            if (!req.user && !req.session.user) {
                console.log('No user found in request or session');
                return res.render('home-guest');
            }

            // Lấy thông tin user từ req.user hoặc req.session.user
            const user = req.user || req.session.user;
            
            // Log để kiểm tra thông tin user
            console.log('User info:', {
                id: user._id,
                username: user.username,
                avatar: user.avatar
            });

            console.log('User ID:', user._id); // Log user ID

            const userId = user._id;
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const endOfMonth = new Date();
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            endOfMonth.setDate(0);
            endOfMonth.setHours(23, 59, 59, 999);

            console.log('Date Range:', { startOfMonth, endOfMonth }); // Log date range

            // Tính tổng thu nhập
            const totalIncome = await Transaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        type: 'income'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            console.log('Total Income Query Result:', totalIncome); // Log kết quả query thu nhập

            // Tính tổng chi tiêu
            const totalExpense = await Transaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        type: 'expense'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            console.log('Total Expense Query Result:', totalExpense); // Log kết quả query chi tiêu

            // Kiểm tra xem có giao dịch nào không
            const transactionCount = await Transaction.countDocuments({ 
                userId: new mongoose.Types.ObjectId(userId) 
            });
            console.log('Transaction Count:', transactionCount); // Log số lượng giao dịch

            // Tính thu nhập tháng này
            const monthlyIncome = await Transaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        type: 'income',
                        date: {
                            $gte: startOfMonth,
                            $lte: endOfMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            // Tính chi tiêu tháng này
            const monthlyExpense = await Transaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        type: 'expense',
                        date: {
                            $gte: startOfMonth,
                            $lte: endOfMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            // Lấy 5 giao dịch gần đây
            const recentTransactions = await Transaction.find({ 
                userId: new mongoose.Types.ObjectId(userId) 
            })
            .populate('categoryId')
            .sort({ date: -1 })
            .limit(5)
            .lean();

            // Lấy danh sách categories
            const categories = await Category.find({ 
                userId: new mongoose.Types.ObjectId(userId) 
            }).lean();

            // Tính toán số dư và các giá trị khác
            const incomeAmount = totalIncome.length > 0 ? totalIncome[0].total : 0;
            const expenseAmount = totalExpense.length > 0 ? totalExpense[0].total : 0;
            const balance = incomeAmount - expenseAmount;

            const monthlyIncomeAmount = monthlyIncome.length > 0 ? monthlyIncome[0].total : 0;
            const monthlyExpenseAmount = monthlyExpense.length > 0 ? monthlyExpense[0].total : 0;

            console.log('Calculated Values:', {
                incomeAmount,
                expenseAmount,
                balance
            });

            // Log dữ liệu trước khi render
            console.log('Data being sent to view:', {
                balance,
                monthlyIncome: monthlyIncomeAmount,
                monthlyExpense: monthlyExpenseAmount
            });

            res.render('home', {
                user: {
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar || '/img/default-avatar.png' // Thêm avatar mặc định
                },
                balance,
                monthlyIncome: monthlyIncomeAmount,
                monthlyExpense: monthlyExpenseAmount,
                recentTransactions,
                categories,
                helpers: {
                    calculatePercentage: (expense, income) => {
                        if (income === 0) return 0;
                        return Math.min((expense / income) * 100, 100);
                    },
                    subtract: (a, b) => a - b,
                    gt: (a, b) => a > b,
                    eq: (a, b) => a === b,
                    getCategoryIcon: (categoryName) => {
                        // Thêm logic map category với icon tương ứng
                        const iconMap = {
                            'Ăn uống': 'fa-utensils',
                            'Di chuyển': 'fa-car',
                            'Mua sắm': 'fa-shopping-cart',
                            // Thêm các mapping khác tùy theo danh mục của bạn
                            'default': 'fa-receipt'
                        };
                        return iconMap[categoryName] || iconMap.default;
                    }
                }
            });

        } catch (error) {
            console.error('Error in home page:', error);
            res.status(500).send('Server Error');
        }
    }

    // [POST] /api/transactions - API endpoint cho thêm giao dịch nhanh
    async quickAddTransaction(req, res) {
        try {
            const userId = req.user._id;
            const { type, amount, categoryId, note } = req.body;

            // Validate input
            if (!type || !amount || !categoryId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Thiếu thông tin giao dịch' 
                });
            }

            // Tạo giao dịch mới
            const newTransaction = new Transaction({
                userId,
                type,
                amount: Number(amount),
                categoryId,
                note,
                date: new Date()
            });

            await newTransaction.save();

            res.json({ 
                success: true, 
                message: 'Thêm giao dịch thành công',
                transaction: newTransaction 
            });

        } catch (error) {
            console.error('Error adding transaction:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi server' 
            });
        }
    }
}

module.exports = new HomeController();
