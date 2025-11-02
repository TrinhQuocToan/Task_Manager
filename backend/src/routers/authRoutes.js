const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getMe,
    getAllUsers,
    getUserById 
} = require('../controllers/authController');

const {
    sendOTP,
    verifyOTPCode,
    resetPasswordWithOTP,
    resendOTP
} = require('../controllers/otpController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);

// Password reset routes (OTP-based)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPCode);
router.post('/reset-password', resetPasswordWithOTP);
router.post('/resend-otp', resendOTP);

// Protected routes (require JWT token)
router.get('/me', protect, getMe);

module.exports = router;
