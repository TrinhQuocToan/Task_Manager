const jwt = require('jsonwebtoken');

/**
 * Middleware để protect routes - yêu cầu JWT token
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header (Bearer token)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production'
            );

            // Add user id to request object
            req.userId = decoded.userId;
            
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired'
                });
            }
            
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token invalid'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

/**
 * Optional middleware - không require token nhưng sẽ set userId nếu có token hợp lệ
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production'
                );
                req.userId = decoded.userId;
            } catch (error) {
                // Token invalid nhưng không báo lỗi, chỉ bỏ qua
                req.userId = null;
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
};
