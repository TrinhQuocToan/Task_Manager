const User = require('../models/Users');

class MeController {

    // [GET] /me/stored/courses
    storedCourses(req, res, next) {
        let courseQuery = Course.find({ deleted: false });

        // Thêm logic sắp xếp
        if (req.query.hasOwnProperty('_sort')) {
            const isValidType = ['asc', 'desc'].includes(req.query.type);
            if (isValidType) {
                courseQuery = courseQuery.sort({
                    [req.query.column]: req.query.type === 'desc' ? -1 : 1
                });
            }
        }

        Promise.all([
            courseQuery.lean(),
            Course.countDocumentsWithDeleted({ deleted: true })
        ])
            .then(([courses, deletedCount]) =>
                res.render('me/stored-course', {
                    courses: courses,
                    deletedCount
                }),
            )
            .catch(next);
    }

    // [GET] /me/trash/courses
    trashCourses(req, res, next) {
        Course.findWithDeleted({ deleted: true }).lean()
            .then((courses) => res.render('me/trash-course', { courses: courses }))
            .catch(next);
    }

    // Hiển thị giao dịch của user
    async showTransactions(req, res, next) {
        try {
            const transactions = await Order.find({ 
                userId: req.user._id 
            })
            .populate('courseId', 'name price') // Lấy thông tin khóa học
            .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu

            res.render('me/transactions', {
                transactions: transactions.map(transaction => transaction.toObject())
            });
        } catch (err) {
            next(err);
        }
    }

    // [GET] /me/profile
    async profile(req, res) {
        try {
            // Lấy thông tin user mới nhất từ database
            const user = await User.findById(req.user._id);
            console.log('Current user data:', user); // Log để kiểm tra dữ liệu hiện tại
            res.render('me/profile', {
                user: user.toObject(),
                pageTitle: 'Thông tin cá nhân'
            });
        } catch (err) {
            console.error('Error:', err);
            req.flash('error', 'Có lỗi xảy ra khi tải thông tin');
            res.redirect('/');
        }
    }

    // [PUT] /me/profile
    async updateProfile(req, res) {
        try {
            const userId = req.user._id;
            console.log('Request body:', req.body);

            // Validate username
            if (req.body.username) {
                if (req.body.username.length < 3 || req.body.username.length > 20) {
                    req.flash('error', 'Tên người dùng phải từ 3-20 ký tự');
                    return res.redirect('/me/profile');
                }
            }

            // Tạo object chứa các trường cần update
            const updateData = {
                username: req.body.username,
                phone: req.body.phone || '',
                address: req.body.address || '',
                avatar: req.body.avatar || req.user.avatar,
                facebook: {
                    url: req.body.facebook || ''
                },
                instagram: req.body.instagram || ''
            };

            console.log('Update data:', updateData);

            // Cập nhật thông tin user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                console.log('User not found');
                req.flash('error', 'Không tìm thấy thông tin người dùng');
                return res.redirect('/me/profile');
            }

            console.log('Updated user:', updatedUser);

            // Cập nhật lại session và req.user
            req.user = updatedUser;
            req.session.user = {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                role: updatedUser.role
            };

            // Đảm bảo session được lưu
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    req.flash('error', 'Có lỗi xảy ra khi lưu thông tin');
                    return res.redirect('/me/profile');
                }
                
                req.flash('success', 'Cập nhật thông tin thành công');
                res.redirect('/me/profile');
            });

        } catch (err) {
            console.error('Error updating profile:', err);
            req.flash('error', 'Có lỗi xảy ra khi cập nhật thông tin');
            res.redirect('/me/profile');
        }
    }

}

module.exports = new MeController();
