const User = require('../models/Users');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

class AuthController {
    // [GET] /auth/login
    showLogin(req, res) {
        // Get messages from query parameters
        const { email, success, error } = req.query;
        
        console.log('Login page params:', { email, success, error });
        
        res.render('auth/login', { 
            layout: 'auth',
            title: 'Đăng nhập',
            email: email || '',
            success: success || '',
            error: error || ''
        });
    }

    // [GET] /auth/register
    showRegister(req, res) {
        res.render('auth/register', { 
            layout: 'auth',
            pageTitle: 'Đăng ký tài khoản'
        });
    }

    // [POST] /auth/login
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            console.log('Login attempt with:', { email, password: '***' });
            
            const user = await User.findOne({ email });
    
            if (!user) {
                console.log('User not found with email:', email);
                req.flash('error', 'Email hoặc mật khẩu không đúng');
                return res.redirect('/auth/login');
            }
            
            console.log('User found:', user.username);
    
            // So sánh password trực tiếp
            const isMatch = user.password === password;
            console.log('Password match result:', isMatch);
            
            if (!isMatch) {
                req.flash('error', 'Email hoặc mật khẩu không đúng');
                return res.redirect('/auth/login');
            }
    
            // Lưu user vào session
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            };
            
            console.log('Session user set:', req.session.user);
    
            // Đảm bảo session được lưu trước khi redirect
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    req.flash('error', 'Có lỗi xảy ra');
                    return res.redirect('/auth/login');
                }
                
                console.log('Session saved successfully');
                req.flash('success', 'Đăng nhập thành công!');
                res.redirect('/');
            });
    
        } catch (error) {
            console.error('Login error:', error);
            req.flash('error', 'Có lỗi xảy ra khi đăng nhập');
            return res.redirect('/auth/login');
        }
    }

    // [POST] /auth/register
    async register(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;
            console.log('Register attempt with:', { username, email, password: '***' });
            
            // Validate input
            if (!username || !email || !password || !confirmPassword) {
                return res.redirect('/auth/register?error=Vui lòng nhập đầy đủ thông tin');
            }
            
            if (password !== confirmPassword) {
                return res.redirect('/auth/register?error=Mật khẩu xác nhận không khớp');
            }
            
            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.redirect('/auth/register?error=Email đã được sử dụng');
            }
            
            // Tạo user mới với password dạng plain text
            const newUser = new User({
                username,
                email,
                password // Lưu trực tiếp, không hash
            });
            
            const savedUser = await newUser.save();
            console.log('User registered successfully:', savedUser.username);
            
            // Redirect to login page with success message and pre-filled email
            return res.redirect(`/auth/login?success=Đăng ký thành công! Vui lòng đăng nhập với tài khoản của bạn.&email=${encodeURIComponent(email)}`);
            
        } catch (error) {
            console.error('Registration error:', error);
            return res.redirect('/auth/register?error=Đã xảy ra lỗi khi đăng ký');
        }
    }

    // [GET] /auth/logout
    logout(req, res) {
        // Clear cookie
        res.clearCookie('token');
        
        // Clear session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.redirect('/auth/login');
        });
    }

    // [GET] /auth/google
    googleAuth(req, res, next) {
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })(req, res, next);
    }

    // [GET] /auth/google/callback
    googleCallback(req, res, next) {
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/auth/login',
            failureFlash: true
        })(req, res, next);
    }

    // [GET] /auth/facebook
    facebookAuth(req, res, next) {
        passport.authenticate('facebook', {
            scope: ['email']
        })(req, res, next);
    }

    // [GET] /auth/facebook/callback
    facebookCallback(req, res, next) {
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/auth/login',
            failureFlash: true
        })(req, res, next);
    }
}

module.exports = new AuthController();