const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_TOKEN);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Get user from DB
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

exports.authorizeRoles = (...roles) => (req, res, next) => {
    try {
        // Ensure user and role exist
        if (!req?.user?.role) {
            return res.status(401).json({ message: 'Unauthorized: No user role found' });
        }

        console.log('User role:', req.user.role);
        // Check if the user's role is allowed
        if (!roles.includes(req.user.role)) {
            console.warn(`Unauthorized Access Attempt: User ${req.user.email || 'Unknown'} tried to access ${req.originalUrl}`);
            return res.status(403).json({ message: "Forbidden: You don't have permission" });
        }

        next();
    } catch (error) {
        console.error('Error in role authorization:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
