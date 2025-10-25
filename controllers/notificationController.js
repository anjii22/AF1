const Notification = require('../models/notificationModel');
const mongoose = require('mongoose');

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification || notification.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ error: "Notification not found" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification || notification.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ error: "Notification not found" });
        }

        await notification.remove();
        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification
};
