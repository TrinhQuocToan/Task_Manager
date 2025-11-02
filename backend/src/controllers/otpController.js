const User = require('../models/User');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpService');
const { sendOTPEmail, sendPasswordChangedEmail } = require('../utils/emailService');

// @desc    Send OTP - Gửi mã OTP qua email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            // Không tiết lộ email có tồn tại hay không (security best practice)
            return res.json({
                success: true,
                message: 'If an account exists with this email, an OTP code has been sent.'
            });
        }

        // Generate OTP (6 digits)
        const otp = generateOTP();
        console.log('🔢 Generated OTP:', otp); // For development only

        // Hash OTP và lưu vào database
        user.otpCode = hashOTP(otp);
        
        // OTP expires in 10 minutes
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        user.otpVerified = false;

        await user.save();

        // Gửi email
        try {
            await sendOTPEmail(user.email, otp, user.username);

            res.json({
                success: true,
                message: 'OTP code has been sent to your email',
                data: {
                    email: user.email,
                    expiresIn: '10 minutes'
                }
            });
        } catch (emailError) {
            // Nếu gửi email thất bại, xóa OTP
            user.otpCode = null;
            user.otpExpires = null;
            await user.save();

            console.error('Email error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Verify OTP - Xác thực mã OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTPCode = async (req, res) => {
    try {
        const { otp } = req.body;

        // Validate input
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide OTP code'
            });
        }

        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'OTP must be 6 digits'
            });
        }

        // Find user với OTP chưa hết hạn
        const user = await User.findOne({
            otpExpires: { $gt: Date.now() }
        });

        if (!user || !user.otpCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP code'
            });
        }

        // Verify OTP
        const isValid = verifyOTP(otp, user.otpCode);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP code'
            });
        }

        // Mark OTP as verified
        user.otpVerified = true;
        await user.save();

        res.json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.',
            data: {
                verified: true
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Reset Password with OTP - Đổi mật khẩu với OTP đã verify
// @route   POST /api/auth/reset-password-otp
// @access  Public
exports.resetPasswordWithOTP = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, OTP, new password and confirm password'
            });
        }

        // Validate password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Validate password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Find user
        const user = await User.findOne({
            email,
            otpExpires: { $gt: Date.now() }
        });

        if (!user || !user.otpCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Verify OTP again
        const isValid = verifyOTP(otp, user.otpCode);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP code'
            });
        }

        // Check if OTP was verified
        if (!user.otpVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify OTP first'
            });
        }

        // Update password
        user.password = newPassword;
        user.otpCode = null;
        user.otpExpires = null;
        user.otpVerified = false;
        await user.save();

        // Gửi email thông báo password đã đổi
        sendPasswordChangedEmail(user.email, user.username);

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password with OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Resend OTP - Gửi lại mã OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, an OTP code has been sent.'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        console.log('🔢 Resent OTP:', otp);

        user.otpCode = hashOTP(otp);
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        user.otpVerified = false;

        await user.save();

        try {
            await sendOTPEmail(user.email, otp, user.username);

            res.json({
                success: true,
                message: 'New OTP code has been sent to your email'
            });
        } catch (emailError) {
            user.otpCode = null;
            user.otpExpires = null;
            await user.save();

            console.error('Email error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
