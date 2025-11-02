const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    username: { 
        type: String, 
        required: true,
        minlength: 3,
        maxlength: 20
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { type: String, required: true },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    facebook: {
        id: String,
        token: String,
        url: String
    },
    instagram: { type: String, default: '' },
    google: {
        id: String,
        token: String
    },
    googleId: String
}, {
    timestamps: true
});

// Thay đổi phương thức comparePassword để so sánh trực tiếp
User.methods.comparePassword = function(password) {
    console.log('Comparing passwords');
    console.log('Input password:', password);
    console.log('Stored password:', this.password);
    
    // So sánh trực tiếp
    return password === this.password;
};

module.exports = mongoose.model('User', User, 'Users');
