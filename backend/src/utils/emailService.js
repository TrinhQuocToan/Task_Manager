const nodemailer = require('nodemailer');

// Tạo transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Gửi email OTP để reset password
exports.sendOTPEmail = async (email, otp, username) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Task Manager" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã OTP - Đặt Lại Mật Khẩu',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background-color: #3B82F6;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background-color: #3B82F6;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        .warning {
                            background-color: #FEF3C7;
                            border-left: 4px solid #F59E0B;
                            padding: 10px;
                            margin: 15px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Đặt Lại Mật Khẩu</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>${username}</strong>,</p>
                            
                            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Task Manager của mình.</p>
                            
                            <p>Mã OTP của bạn là:</p>
                            
                            <center>
                                <div style="background-color: #3B82F6; color: white; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                                    ${otp}
                                </div>
                            </center>
                            
                            <div class="warning">
                                <strong>⚠️ Quan trọng:</strong> Mã này sẽ hết hạn sau <strong>10 phút</strong>.
                            </div>
                            
                            <p>Vui lòng nhập mã này trên trang đặt lại mật khẩu để tiếp tục.</p>
                            
                            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.</p>
                            
                            <p>Trân trọng,<br>Đội ngũ Task Manager</p>
                        </div>
                        <div class="footer">
                            <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
                            <p>&copy; 2025 Task Manager. Bảo lưu mọi quyền.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Email send error:', error);
        throw new Error('Failed to send email');
    }
};

// Gửi email thông báo password đã được đổi
exports.sendPasswordChangedEmail = async (email, username) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Task Manager" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Đổi Mật Khẩu Thành Công - Task Manager',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background-color: #10B981;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        .info {
                            background-color: #DBEAFE;
                            border-left: 4px solid #3B82F6;
                            padding: 10px;
                            margin: 15px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Đổi Mật Khẩu Thành Công</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>${username}</strong>,</p>
                            
                            <p>Mật khẩu của bạn đã được thay đổi thành công.</p>
                            
                            <div class="info">
                                <strong>ℹ️ Lưu ý:</strong> Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi ngay lập tức.
                            </div>
                            
                            <p>Bây giờ bạn có thể đăng nhập vào tài khoản với mật khẩu mới.</p>
                            
                            <p>Trân trọng,<br>Đội ngũ Task Manager</p>
                        </div>
                        <div class="footer">
                            <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
                            <p>&copy; 2025 Task Manager. Bảo lưu mọi quyền.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password changed email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Email send error:', error);
        // Không throw error vì đây chỉ là notification
        return { success: false, error: error.message };
    }
};
