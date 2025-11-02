const jwt = require('jsonwebtoken');
const User = require('../models/Users');

module.exports = {
    requireAuth: async (req, res, next) => {
        try {
            // Kiểm tra session user trước
            if (req.session.user) {
                req.user = req.session.user;
                return next();
            }

            // Kiểm tra token
            const token = req.cookies.token;
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.userId);
                    if (user) {
                        // Lưu thông tin user vào session và request
                        req.user = {
                            _id: user._id,
                            username: user.username,
                            email: user.email,
                            avatar: user.avatar,
                            role: user.role
                        };
                        req.session.user = req.user;
                        return next();
                    }
                } catch (tokenError) {
                    console.error('Token verification error:', tokenError);
                    res.clearCookie('token');
                }
            }

            req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
            return res.redirect('/auth/login');

        } catch (error) {
            console.error('Auth middleware error:', error);
            req.flash('error', 'Lỗi xác thực, vui lòng đăng nhập lại');
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }
    },

    checkUser: async (req, res, next) => {
        try {
            console.log('CheckUser middleware:');
            console.log('- Session user:', req.session.user);
            console.log('- Passport user:', req.user);
            
            // Kiểm tra session user trước
            if (req.session.user) {
                res.locals.user = req.session.user;
                console.log('User set from session:', res.locals.user);
                return next();
            }
            
            // Kiểm tra passport user
            if (req.user) {
                res.locals.user = {
                    _id: req.user._id,
                    username: req.user.username,
                    email: req.user.email,
                    avatar: req.user.avatar,
                    role: req.user.role
                };
                // Lưu vào session
                req.session.user = res.locals.user;
                console.log('User set from passport:', res.locals.user);
                return next();
            }
            
            // Kiểm tra token
            const token = req.cookies.token;
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.userId);
                    if (user) {
                        res.locals.user = {
                            _id: user._id,
                            username: user.username,
                            email: user.email,
                            avatar: user.avatar,
                            role: user.role
                        };
                        req.session.user = res.locals.user;
                        console.log('User set from token:', res.locals.user);
                        return next();
                    }
                } catch (tokenError) {
                    console.error('Token verification error:', tokenError);
                    res.clearCookie('token');
                }
            }
    
            // Nếu không có user
            console.log('No user found, setting to null');
            res.locals.user = null;
            next();
        } catch (error) {
            console.error('Check user error:', error);
            res.locals.user = null;
            next();
        }
    }
};
