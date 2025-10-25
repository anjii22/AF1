const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const { 
    getAllUsers,
    getUser,
    createAdminUser,
    deleteUser,
    updateUser } = require('../controllers/userController');

const router = express.Router();

//GET all users
router.get('/', authMiddleware.protect , authMiddleware.authorizeRoles('admin') , getAllUsers);

//GET a user by ID
router.get('/:id', authMiddleware.protect , authMiddleware.authorizeRoles('admin') , getUser);

// POST/Create a new admin user
router.post('/adminuser', authMiddleware.protect , authMiddleware.authorizeRoles('admin') , createAdminUser);

//DELETE a user
router.delete('/:id', authMiddleware.protect , deleteUser);

// PATCH/UPDATE a user
router.patch('/:id', authMiddleware.protect , updateUser);

module.exports = router;