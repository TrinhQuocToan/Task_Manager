const mongoose = require('mongoose');
const Category = require('../app/models/Category');
const User = require('../models/User');
require('dotenv').config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        try {
            // Lấy người dùng đầu tiên để gán cho các danh mục không có userId
            const firstUser = await User.findOne();
            
            if (!firstUser) {
                console.log('No users found');
                process.exit(0);
            }
            
            // Tìm tất cả danh mục không có userId
            const categories = await Category.find({ userId: { $exists: false } });
            
            console.log(`Found ${categories.length} categories without userId`);
            
            // Cập nhật từng danh mục
            for (const category of categories) {
                category.userId = firstUser._id;
                await category.save();
                console.log(`Updated category: ${category.name}`);
            }
            
            console.log('All categories updated successfully');
        } catch (error) {
            console.error('Error updating categories:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });
