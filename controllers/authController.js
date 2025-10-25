require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { processRecurringTransactions } = require('../services/transactionService');

//User registration
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists!' });
        }
        
        // Check if user is admin
        if (role && req.user?.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can create admin users" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        
        // Generate access token
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET_TOKEN,
            { expiresIn: '15m' }
        );
        // Generate refresh token
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET_TOKEN,
            { expiresIn: '24h' }
        );

        // Store refresh token in DB
        user.refreshTokens.push(refreshToken);
        await user.save();
        
        res.status(201).json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//User login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Email!' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Password!' });
        }
        
        // Generate access token
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET_TOKEN,
            { expiresIn: '15m' }
        );
        // Generate refresh token
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET_TOKEN,
            { expiresIn: '24h' }
        );

        // Process recurring transactions every time a user logs in
        await processRecurringTransactions();

        // Store refresh token in DB
        user.refreshTokens.push(refreshToken);
        await user.save();
        
        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Refresh token
exports.refreshToken = async (req, res) => {
    // const { refreshToken } = req.body;
    // if (!refreshToken) {
    //     return res.status(401).json({ message: 'Unauthorized' });
    // };

    // Check if refresh token is valid
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        };

        // Generate new access token
        const newAccessToken = jwt.sign(
            { userId: decoded.user._id },
            process.env.JWT_ACCESS_SECRET_TOKEN,
            { expiresIn: '10m' }
        );
        res.json({ accessToken: newAccessToken });
    });
};

// Logout (Delete refresh token)
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(403).json({ message: 'No refresh token provided' });
        }

        // Find user and remove refresh token
        await User.updateOne({ refreshTokens: refreshToken }, { $pull: { refreshTokens: refreshToken } });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};