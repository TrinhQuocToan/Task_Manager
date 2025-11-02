const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = mongoose.Types.ObjectId;

class TransactionController {
    // [GET] /transactions
    async index(req, res) {
        try {
            const userId = req.user._id;
            
            // Xử lý bộ lọc
            const filter = {
                type: req.query.type || '',
                startDate: req.query.startDate || '',
                endDate: req.query.endDate || '',
                sortField: req.query.sortField || 'date',
                sortOrder: req.query.sortOrder || 'desc'
            };
            
            // Xây dựng query
            const query = { userId };
            
            if (filter.type) {
                query.type = filter.type;
            }
            
            if (filter.startDate || filter.endDate) {
                query.date = {};
                if (filter.startDate) {
                    query.date.$gte = new Date(filter.startDate);
                }
                if (filter.endDate) {
                    query.date.$lte = new Date(filter.endDate);
                }
            }

            // Lấy transactions và populate categoryId
            let transactions = await Transaction.find(query)
                .populate('categoryId')
                .lean();

            // Sắp xếp dữ liệu
            if (filter.sortField === 'category') {
                // Sắp xếp theo tên danh mục
                transactions.sort((a, b) => {
                    const nameA = a.categoryId?.name || '';
                    const nameB = b.categoryId?.name || '';
                    return filter.sortOrder === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            } else {
                // Sắp xếp theo các trường khác
                const sortField = filter.sortField;
                transactions.sort((a, b) => {
                    let valueA = a[sortField];
                    let valueB = b[sortField];
                    
                    // Xử lý đặc biệt cho ngày
                    if (sortField === 'date') {
                        valueA = new Date(valueA);
                        valueB = new Date(valueB);
                    }
                    
                    if (filter.sortOrder === 'asc') {
                        return valueA > valueB ? 1 : -1;
                    } else {
                        return valueA < valueB ? 1 : -1;
                    }
                });
            }

            res.render('transactions', {
                transactions,
                filter
            });
        } catch (error) {
            console.error('Error in transactions index:', error);
            req.flash('error', 'Có lỗi xảy ra');
            res.redirect('/');
        }
    }

    // [GET] /transactions/create
    async create(req, res) {
        try {
            const userId = req.user._id;
            
            // Lấy danh sách categories mới nhất và phân loại theo type
            const categories = await Category.find({ 
                userId: new ObjectId(userId) 
            }).lean();

            // Tách categories theo loại
            const expenseCategories = categories.filter(cat => cat.type === 'expense');
            const incomeCategories = categories.filter(cat => cat.type === 'income');

            // Tính số dư hiện tại
            const [totalIncome, totalExpense] = await Promise.all([
                Transaction.aggregate([
                    { $match: { userId: new ObjectId(userId), type: 'income' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]),
                Transaction.aggregate([
                    { $match: { userId: new ObjectId(userId), type: 'expense' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ])
            ]);

            const balance = (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0);

            console.log('Categories loaded:', {
                expense: expenseCategories.length,
                income: incomeCategories.length,
                balance: balance
            });
            
            res.render('transactions/create', {
                expenseCategories,
                incomeCategories,
                balance,
                currentDate: moment().format('YYYY-MM-DD')
            });
        } catch (error) {
            console.error('Error in create transaction:', error);
            req.flash('error', 'Có lỗi xảy ra khi tạo giao dịch mới');
            res.redirect('/transactions');
        }
    }

    // [POST] /transactions/store
    async store(req, res) {
        try {
            const userId = req.user._id;
            const { type, categoryId, amount, date, note } = req.body;
            
            // Kiểm tra category có tồn tại và thuộc về user không
            const category = await Category.findOne({
                _id: categoryId,
                userId: userId
            });

            if (!category) {
                req.flash('error', 'Danh mục không hợp lệ');
                return res.redirect('/transactions/create');
            }
            
            const newTransaction = new Transaction({
                userId,
                type,
                categoryId,
                amount,
                date,
                note
            });
            
            await newTransaction.save();
            req.flash('success', 'Thêm giao dịch thành công');
            res.redirect('/transactions');
        } catch (error) {
            console.error('Error in store transaction:', error);
            req.flash('error', 'Có lỗi xảy ra khi thêm giao dịch');
            res.redirect('/transactions/create');
        }
    }

    // [GET] /transactions/edit/:id
    async edit(req, res) {
        try {
            const userId = req.user._id;
            
            // Lấy transaction và populate đầy đủ thông tin category
            const transaction = await Transaction.findOne({
                _id: req.params.id,
                userId
            }).populate({
                path: 'categoryId',
                select: 'name type'
            }).lean();
            
            if (!transaction) {
                req.flash('error', 'Không tìm thấy giao dịch');
                return res.redirect('/transactions');
            }
            
            // Format date cho input field
            transaction.formattedDate = moment(transaction.date).format('YYYY-MM-DD');
            
            // Lấy danh sách categories và phân loại
            const categories = await Category.find({ userId }).lean();
            const expenseCategories = categories.filter(cat => cat.type === 'expense');
            const incomeCategories = categories.filter(cat => cat.type === 'income');

            // Debug logs
            console.log('Transaction data:', transaction);
            console.log('Categories:', {
                expense: expenseCategories,
                income: incomeCategories
            });
            
            res.render('transactions/edit', {
                transaction,
                expenseCategories,
                incomeCategories
            });
        } catch (error) {
            console.error('Error in edit transaction:', error);
            req.flash('error', 'Có lỗi xảy ra');
            res.redirect('/transactions');
        }
    }

    // [PUT] /transactions/:id
    async update(req, res) {
        try {
            const userId = req.user._id;
            const { type, categoryId, amount, date, note } = req.body;
            
            const transaction = await Transaction.findOne({
                _id: req.params.id,
                userId
            });
            
            if (!transaction) {
                req.flash('error', 'Không tìm thấy giao dịch');
                return res.redirect('/transactions');
            }
            
            transaction.type = type;
            transaction.categoryId = categoryId;
            transaction.amount = amount;
            transaction.date = date;
            transaction.note = note;
            
            await transaction.save();
            
            req.flash('success', 'Cập nhật giao dịch thành công');
            res.redirect('/transactions');
        } catch (error) {
            console.error('Error in update transaction:', error);
            req.flash('error', 'Có lỗi xảy ra khi cập nhật giao dịch');
            res.redirect(`/transactions/edit/${req.params.id}`);
        }
    }

    // [DELETE] /transactions/:id
    async destroy(req, res) {
        try {
            const userId = req.user._id;
            const result = await Transaction.deleteOne({
                _id: req.params.id,
                userId
            });
            
            if (result.deletedCount === 0) {
                req.flash('error', 'Không tìm thấy giao dịch');
                return res.redirect('/transactions');
            }
            
            req.flash('success', 'Xóa giao dịch thành công');
            res.redirect('/transactions');
        } catch (error) {
            console.error('Error in delete transaction:', error);
            req.flash('error', 'Có lỗi xảy ra khi xóa giao dịch');
            res.redirect('/transactions');
        }
    }
}

module.exports = new TransactionController();
