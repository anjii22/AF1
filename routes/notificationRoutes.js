const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const {
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification
} = require('../controllers/notificationController');

const router = express.Router();

//GET all notifications
router.get('/', authMiddleware.protect, getUserNotifications);

//GET a notification
//router.get('/:id', authMiddleware.protect, getNotification);

//Mark a notification as read
router.patch('/:id', authMiddleware.protect, markNotificationAsRead);

//DELETE a notification
router.delete('/:id', authMiddleware.protect, deleteNotification);

module.exports = router;