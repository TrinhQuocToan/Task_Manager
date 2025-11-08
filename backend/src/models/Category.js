const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true
    },
    color: {
        type: String,
        default: '#198754'
    },
    icon: {
        type: String,
        default: 'fa-tag'
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for soft delete queries
categorySchema.index({ userId: 1, deleted: 1 });

// Query helper để exclude deleted items by default
categorySchema.pre(/^find/, function(next) {
    // Chỉ filter deleted nếu không có query.deleted
    if (this.getQuery().deleted === undefined) {
        this.where({ deleted: false });
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema, 'categories');

