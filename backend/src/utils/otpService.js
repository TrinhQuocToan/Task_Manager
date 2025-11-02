const crypto = require('crypto');

/**
 * Generate OTP code (6 chữ số)
 */
exports.generateOTP = () => {
    // Generate random 6 digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};

/**
 * Hash OTP trước khi lưu database
 */
exports.hashOTP = (otp) => {
    return crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
};

/**
 * Verify OTP
 */
exports.verifyOTP = (inputOtp, hashedOtp) => {
    const hashedInput = crypto
        .createHash('sha256')
        .update(inputOtp)
        .digest('hex');
    
    return hashedInput === hashedOtp;
};
