const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    amount: {
        type: Number,
        required: true
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    currentSpending: {
        type: Number,
        default: 0
    },
    alertsEnabled: {
        type: Boolean,
        default: true
    },
    alertThreshold: {
        type: Number,
        default: 80
    }
    
}, {
    timestamps: true
});

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
