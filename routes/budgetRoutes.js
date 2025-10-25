const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const {
    getAllBudgets,
    getAllUserBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget
} = require('../controllers/budgetController');

const router = express.Router();

//GET all budgets
router.get('/', authMiddleware.protect, getAllBudgets);

//GET all user budgets
router.get('/user', authMiddleware.protect, getAllUserBudgets);

//GET a budget
router.get('/:id', authMiddleware.protect, getBudget);

//POST/Create a new budget
router.post('/', authMiddleware.protect, createBudget);

//PUT/Update a budget
router.put('/:id', authMiddleware.protect, updateBudget);

//DELETE a budget
router.delete('/:id', authMiddleware.protect, deleteBudget);

module.exports = router;