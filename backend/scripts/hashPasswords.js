require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Hash passwords for existing users
const hashPasswords = async () => {
    try {
        // Kết nối database
        await connectDB();

        // Lấy collection users trực tiếp (không qua model để tránh pre-save hook)
        const usersCollection = mongoose.connection.collection('users');

        // Lấy tất cả users
        const users = await usersCollection.find({}).toArray();
        console.log(`\n📊 Found ${users.length} users in database\n`);

        let updatedCount = 0;

        // Duyệt qua từng user
        for (const user of users) {
            // Kiểm tra xem password đã được hash chưa
            // Bcrypt hash luôn bắt đầu với $2a$, $2b$, hoặc $2y$
            const isHashed = user.password && user.password.startsWith('$2');

            if (!isHashed) {
                console.log(`🔄 Hashing password for user: ${user.username} (${user.email})`);
                
                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);

                // Cập nhật password trong database
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { password: hashedPassword } }
                );

                console.log(`   ✅ Updated password for ${user.username}`);
                updatedCount++;
            } else {
                console.log(`⏭️  Skipping ${user.username} - password already hashed`);
            }
        }

        console.log(`\n✨ Done! Updated ${updatedCount} user(s)`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        // Đóng kết nối
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
        process.exit(0);
    }
};

// Chạy script
console.log('🚀 Starting password hashing script...\n');
hashPasswords();
