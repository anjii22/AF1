const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

//GET all categories
router.get('/', authMiddleware.protect, getAllCategories);

//GET a category
router.get('/:id', authMiddleware.protect, getCategory);

//POST/Create a new category
router.post('/', authMiddleware.protect, authMiddleware.authorizeRoles('admin'), createCategory);

//PUT/Update a category
router.put('/:id', authMiddleware.protect, authMiddleware.authorizeRoles('admin'), updateCategory);

//DELETE a category
router.delete('/:id', authMiddleware.protect, authMiddleware.authorizeRoles('admin'), deleteCategory);

module.exports = router;