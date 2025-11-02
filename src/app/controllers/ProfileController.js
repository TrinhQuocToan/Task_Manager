const User = require('../models/Users');

class ProfileController {
    // [GET] /me/profile
    async show(req, res) {
        try {
            const user = await User.findById(req.user._id).lean();
            res.render('me/profile', { 
                user,
                pageTitle: 'Thông tin cá nhân'
            });
        } catch (error) {
            console.error('Profile error:', error);
            req.flash('error', 'Có lỗi xảy ra khi tải thông tin profile');
            res.redirect('/');
        }
    }

    // [PUT] /me/profile
    async update(req, res) {
        try {
            const { username, email, phone, address, avatar, facebook, instagram } = req.body;
            const userId = req.user._id;

            // Validate username
            if (!username || username.length < 3 || username.length > 20) {
                req.flash('error', 'Tên người dùng phải từ 3-20 ký tự');
                return res.redirect('/me/profile');
            }

            // Kiểm tra email đã tồn tại
            const existingUser = await User.findOne({
                _id: { $ne: userId },
                email: email
            });

            if (existingUser) {
                req.flash('error', 'Email đã tồn tại');
                return res.redirect('/me/profile');
            }

            // Cập nhật thông tin user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        username: username,
                        email: email,
                        phone: phone || '',
                        address: address || '',
                        avatar: avatar || 'https://secure.gravatar.com/avatar/default?s=200&d=mp',
                        'facebook.url': facebook || '',
                        instagram: instagram || ''
                    }
                },
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                req.flash('error', 'Không tìm thấy người dùng');
                return res.redirect('/me/profile');
            }

            // Cập nhật session
            req.session.user = updatedUser;
            
            // Cập nhật req.user cho Passport
            req.user = updatedUser;

            req.flash('success', 'Cập nhật thông tin thành công!');
            res.redirect('/me/profile');

        } catch (error) {
            console.error('Update profile error:', error);
            req.flash('error', 'Có lỗi xảy ra khi cập nhật thông tin');
            res.redirect('/me/profile');
        }
    }
}

module.exports = new ProfileController();
