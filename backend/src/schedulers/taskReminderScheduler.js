const cron = require('cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskReminderEmail } = require('../utils/emailService');

// Cron job chạy mỗi phút để check task reminder
const taskReminderJob = new cron.CronJob(
    '* * * * *', // Chạy mỗi phút
    async function() {
        try {
            console.log('🔍 Checking for task reminders...');
            
            const now = new Date();
            
            // Tìm các task cần gửi reminder:
            // - reminderAt <= now (đã đến giờ nhắc)
            // - reminderSent = false (chưa gửi)
            // - status không phải Completed hoặc Cancelled
            const tasksToRemind = await Task.find({
                reminderAt: {
                    $exists: true,
                    $ne: null,
                    $lte: now
                },
                reminderSent: false,
                status: {
                    $nin: ['Completed', 'Cancelled']
                }
            })
            .populate('userId', 'username email')
            .populate('categoryId', 'name')
            .limit(50); // Giới hạn 50 tasks mỗi lần để tránh overload
            
            if (tasksToRemind.length === 0) {
                console.log('✅ No reminders to send');
                return;
            }
            
            console.log(`📧 Found ${tasksToRemind.length} task(s) to send reminders`);
            
            // Gửi email cho từng task
            const emailPromises = tasksToRemind.map(async (task) => {
                try {
                    if (!task.userId || !task.userId.email) {
                        console.log(`⚠️ Skipping task ${task._id}: No user email`);
                        return null;
                    }
                    
                    // Gửi email
                    const result = await sendTaskReminderEmail(
                        task.userId.email,
                        task.userId.username,
                        task
                    );
                    
                    if (result.success) {
                        // Đánh dấu đã gửi reminder
                        task.reminderSent = true;
                        await task.save();
                        
                        console.log(`✅ Reminder sent for task: ${task.title}`);
                        return { success: true, taskId: task._id };
                    } else {
                        console.error(`❌ Failed to send reminder for task: ${task.title}`, result.error);
                        return { success: false, taskId: task._id, error: result.error };
                    }
                    
                } catch (error) {
                    console.error(`❌ Error processing reminder for task ${task._id}:`, error);
                    return { success: false, taskId: task._id, error: error.message };
                }
            });
            
            const results = await Promise.all(emailPromises);
            const successCount = results.filter(r => r && r.success).length;
            const failCount = results.filter(r => r && !r.success).length;
            
            console.log(`📊 Reminder Summary: ${successCount} sent, ${failCount} failed`);
            
        } catch (error) {
            console.error('❌ Task reminder scheduler error:', error);
        }
    },
    null, // onComplete
    false, // start
    'Asia/Ho_Chi_Minh' // timezone
);

module.exports = { taskReminderJob };

