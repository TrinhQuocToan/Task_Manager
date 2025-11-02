const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['expense', 'income'],
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    icon: {
        type: String,
        default: 'fa-tag'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
