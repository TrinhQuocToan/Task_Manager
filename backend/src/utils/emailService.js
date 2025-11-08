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

// Gửi email nhắc nhở task
exports.sendTaskReminderEmail = async (email, username, task) => {
    try {
        const transporter = createTransporter();

        const dueDate = new Date(task.dueDate).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const priorityColor = {
            'Low': '#6B7280',
            'Medium': '#F59E0B',
            'High': '#EF4444'
        };

        const priorityIcon = {
            'Low': '🔵',
            'Medium': '🟡',
            'High': '🔴'
        };

        const mailOptions = {
            from: `"Task Manager" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `⏰ Nhắc nhở: ${task.title}`,
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
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background-color: #ffffff;
                            padding: 30px;
                            border: 1px solid #e5e7eb;
                            border-top: none;
                        }
                        .task-card {
                            background-color: #f9fafb;
                            border-left: 4px solid ${priorityColor[task.priority]};
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .task-title {
                            font-size: 20px;
                            font-weight: bold;
                            color: #1f2937;
                            margin-bottom: 15px;
                        }
                        .task-detail {
                            display: flex;
                            align-items: center;
                            margin: 10px 0;
                            font-size: 14px;
                        }
                        .task-detail-icon {
                            margin-right: 10px;
                            min-width: 20px;
                        }
                        .priority-badge {
                            display: inline-block;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            background-color: ${priorityColor[task.priority]};
                            color: white;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            color: #6b7280;
                            font-size: 12px;
                        }
                        .warning-box {
                            background-color: #FEF3C7;
                            border-left: 4px solid #F59E0B;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⏰ Nhắc Nhở Task</h1>
                            <p style="margin: 10px 0 0; opacity: 0.9;">Bạn có một task cần chú ý!</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>${username}</strong>,</p>
                            
                            <p>Đây là email nhắc nhở về task của bạn:</p>
                            
                            <div class="task-card">
                                <div class="task-title">📋 ${task.title}</div>
                                
                                ${task.description ? `
                                <div class="task-detail">
                                    <span class="task-detail-icon">📝</span>
                                    <span>${task.description}</span>
                                </div>
                                ` : ''}
                                
                                <div class="task-detail">
                                    <span class="task-detail-icon">📅</span>
                                    <span><strong>Deadline:</strong> ${dueDate}</span>
                                </div>
                                
                                <div class="task-detail">
                                    <span class="task-detail-icon">⚡</span>
                                    <span><strong>Độ ưu tiên:</strong> <span class="priority-badge">${priorityIcon[task.priority]} ${task.priority}</span></span>
                                </div>
                                
                                <div class="task-detail">
                                    <span class="task-detail-icon">📊</span>
                                    <span><strong>Trạng thái:</strong> ${task.status}</span>
                                </div>
                                
                                ${task.categoryId ? `
                                <div class="task-detail">
                                    <span class="task-detail-icon">🏷️</span>
                                    <span><strong>Danh mục:</strong> ${task.categoryId.name}</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            ${task.status !== 'Completed' ? `
                            <div class="warning-box">
                                <strong>⚠️ Lưu ý:</strong> Task này chưa hoàn thành. Hãy kiểm tra và cập nhật trạng thái!
                            </div>
                            ` : ''}
                            
                            <center>
                                <a href="${process.env.FRONTEND_URL}/tasks/${task._id}" class="button">
                                    Xem Chi Tiết Task
                                </a>
                            </center>
                            
                            <p>Chúc bạn làm việc hiệu quả! 💪</p>
                            
                            <p>Trân trọng,<br>Đội ngũ Task Manager</p>
                        </div>
                        <div class="footer">
                            <p>Đây là email tự động từ hệ thống nhắc nhở.</p>
                            <p>&copy; 2025 Task Manager. Bảo lưu mọi quyền.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Task reminder email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Task reminder email send error:', error);
        return { success: false, error: error.message };
    }
};
