const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const { 
    getAllTransactions,
    getUserTransactions,
    getTransaction,
    createTransaction,
    deleteTransaction,
    updateTransaction } = require('../controllers/transactionController');

const router = express.Router();

//GET all transactions
router.get('/', authMiddleware.protect, authMiddleware.authorizeRoles('admin'), getAllTransactions);

//GET users transactions
router.get('/user', authMiddleware.protect, authMiddleware.authorizeRoles('user'), getUserTransactions);

//GET a transaction by ID
router.get('/:id', authMiddleware.protect , getTransaction);

// POST/Create a new transaction
router.post('/', authMiddleware.protect , createTransaction);

//DELETE a transaction
router.delete('/:id', authMiddleware.protect , authMiddleware.authorizeRoles('admin') , deleteTransaction);

// PATCH/UPDATE a transaction
router.patch('/:id', authMiddleware.protect , authMiddleware.authorizeRoles('admin') , updateTransaction);

module.exports = router;