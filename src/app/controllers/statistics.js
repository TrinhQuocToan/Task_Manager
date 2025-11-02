const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const moment = require('moment');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

// Đăng ký helpers
const helpers = {
    lt: function(a, b) {
        return a < b;
    },
    eq: function(a, b) {
        return a === b;
    },
    multiply: function(a, b) {
        return a * b;
    },
    formatCurrency: function(number) {
        if (typeof number !== 'number') return '0';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(number);
    }
};

class StatisticsController {
    // Middleware xác thực
    index = async (req, res) => {
        try {
            // Kiểm tra user
            const user = req.user || req.session.user;
            if (!user) {
                req.flash('error', 'Vui lòng đăng nhập để xem thống kê');
                return res.redirect('/auth/login');
            }

            // Xử lý ngày tháng
            moment.locale('vi');
            let startDate = req.query.startDate 
                ? moment(req.query.startDate).startOf('day')
                : moment().startOf('month');
            let endDate = req.query.endDate 
                ? moment(req.query.endDate).endOf('day')
                : moment().endOf('month');

            console.log('Date Range:', {
                startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
                endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
            });

            const userObjectId = new mongoose.Types.ObjectId(user._id);

            // Điều kiện truy vấn cơ bản
            const matchCondition = {
                userId: userObjectId,
                date: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate()
                }
            };

            // Tính tổng thu nhập và chi tiêu
            const [incomeResult, expenseResult] = await Promise.all([
                Transaction.aggregate([
                    {
                        $match: {
                            ...matchCondition,
                            type: 'income'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]),
                Transaction.aggregate([
                    {
                        $match: {
                            ...matchCondition,
                            type: 'expense'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ])
            ]);

            const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
            const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
            const balance = totalIncome - totalExpense;

            // Chi tiêu theo danh mục
            const expenseByCategory = await Transaction.aggregate([
                {
                    $match: {
                        ...matchCondition,
                        type: 'expense'
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $group: {
                        _id: '$category.name',
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { total: -1 } }
            ]);

            // Dữ liệu theo ngày
            const dailyData = await Transaction.aggregate([
                {
                    $match: matchCondition
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                            type: "$type"
                        },
                        total: { $sum: "$amount" }
                    }
                },
                { $sort: { "_id.date": 1 } }
            ]);

            // Tạo mảng các ngày trong khoảng
            const dates = [];
            let currentDate = moment(startDate);
            while (currentDate <= moment(endDate)) {
                dates.push(currentDate.format('YYYY-MM-DD'));
                currentDate.add(1, 'days');
            }

            // Chuẩn bị dữ liệu cho biểu đồ đường
            const dailyStats = dates.map(date => ({
                date: date,
                income: dailyData.find(d => d._id.date === date && d._id.type === 'income')?.total || 0,
                expense: dailyData.find(d => d._id.date === date && d._id.type === 'expense')?.total || 0
            }));

            // Lấy danh sách giao dịch
            const transactions = await Transaction.find(matchCondition)
                .populate('categoryId')
                .sort({ date: -1 })
                .lean();

            // Render view với dữ liệu
            res.render('statistics', {
                user: {
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar || '/img/default-avatar.png'
                },
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                totalIncome,
                totalExpense,
                balance,
                expenseByCategory,
                transactions,
                pieChartData: JSON.stringify({
                    labels: expenseByCategory.map(item => item._id),
                    data: expenseByCategory.map(item => item.total)
                }),
                lineChartData: JSON.stringify({
                    labels: dailyStats.map(d => moment(d.date).format('DD/MM')),
                    income: dailyStats.map(d => d.income),
                    expense: dailyStats.map(d => d.expense)
                })
            });

        } catch (error) {
            console.error('Error in statistics:', error);
            console.error('Error stack:', error.stack);
            req.flash('error', 'Có lỗi xảy ra khi tải dữ liệu thống kê');
            res.status(500).send('Lỗi máy chủ');
        }
    }
}

module.exports = new StatisticsController();
