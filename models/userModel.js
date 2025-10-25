const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    
    refreshTokens: [{
        type: String,
        default: []
    }]
    // budgets: [{
    //     category: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Category'
    //     },
    //     amount: Number,
    //     period: {
    //         type: String,
    //         enum: ['daily', 'weekly', 'monthly', 'yearly']
    //     }
    // }],
    // goals: [{
    //     name: String,
    //     targetAmount: Number,
    //     currentAmount: {
    //         type: Number,
    //         default: 0
    //     },
    //     deadline: Date
    // }]
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;