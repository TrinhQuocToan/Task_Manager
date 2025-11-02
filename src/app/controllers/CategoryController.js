const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

class CategoryController {
    // [GET] /categories
    async index(req, res) {
        try {
            const userId = req.user._id;
            // Thêm điều kiện lọc theo userId
            const categories = await Category.find({ 
                userId: new mongoose.Types.ObjectId(userId) 
            }).lean();
            
            res.render('categories', { categories });
        } catch (error) {
            console.error('Error in categories index:', error);
            res.status(500).send('Server Error');
        }
    }

    // [GET] /categories/create
    create(req, res) {
        res.render('categories/create');
    }

    // [POST] /categories/store
    async store(req, res) {
        try {
            const userId = req.user._id;
            const { name, type, icon } = req.body;
            
            // Kiểm tra xem danh mục đã tồn tại chưa
            const existingCategory = await Category.findOne({ 
                name: name,
                userId: userId,
                type: type
            });

            if (existingCategory) {
                req.flash('error', 'Danh mục này đã tồn tại');
                return res.redirect('/categories/create');
            }

            const newCategory = new Category({
                name,
                type,
                icon,
                userId
            });
            await newCategory.save();
            req.flash('success', 'Thêm danh mục thành công');
            res.redirect('/categories');
        } catch (error) {
            console.error('Error creating category:', error);
            req.flash('error', 'Có lỗi xảy ra khi thêm danh mục');
            res.redirect('/categories/create');
        }
    }

    // [GET] /categories/:id/edit
    async edit(req, res) {
        try {
            const userId = req.user._id;
            const category = await Category.findOne({
                _id: req.params.id,
                userId: userId
            }).lean();

            if (!category) {
                req.flash('error', 'Không tìm thấy danh mục');
                return res.redirect('/categories');
            }
            res.render('categories/edit', { category });
        } catch (error) {
            console.error('Error editing category:', error);
            req.flash('error', 'Có lỗi xảy ra');
            res.redirect('/categories');
        }
    }

    // [PUT] /categories/:id
    async update(req, res) {
        try {
            const userId = req.user._id;
            const { name, type, icon } = req.body;

            // Kiểm tra quyền sở hữu danh mục
            const category = await Category.findOne({
                _id: req.params.id,
                userId: userId
            });

            if (!category) {
                req.flash('error', 'Không tìm thấy danh mục');
                return res.redirect('/categories');
            }

            await Category.findByIdAndUpdate(req.params.id, { name, type, icon });
            req.flash('success', 'Cập nhật danh mục thành công');
            res.redirect('/categories');
        } catch (error) {
            console.error('Error updating category:', error);
            req.flash('error', 'Có lỗi xảy ra khi cập nhật danh mục');
            res.redirect('/categories');
        }
    }

    // [DELETE] /categories/:id
    async delete(req, res) {
        try {
            const userId = req.user._id;

            // Kiểm tra quyền sở hữu danh mục
            const category = await Category.findOne({
                _id: req.params.id,
                userId: userId
            });

            if (!category) {
                req.flash('error', 'Không tìm thấy danh mục');
                return res.redirect('/categories');
            }

            // Kiểm tra xem danh mục có đang được sử dụng không
            const transactionCount = await Transaction.countDocuments({ 
                categoryId: req.params.id,
                userId: userId
            });

            if (transactionCount > 0) {
                req.flash('error', 'Không thể xóa danh mục đang được sử dụng trong giao dịch');
                return res.redirect('/categories');
            }
            
            await Category.findByIdAndDelete(req.params.id);
            req.flash('success', 'Xóa danh mục thành công');
            res.redirect('/categories');
        } catch (error) {
            console.error('Error deleting category:', error);
            req.flash('error', 'Có lỗi xảy ra khi xóa danh mục');
            res.redirect('/categories');
        }
    }
}

module.exports = new CategoryController();
