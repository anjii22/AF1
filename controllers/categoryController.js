const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

//GET all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: 1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//GET a category
const getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        //check if the id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Category not found(Invalid ID)" });
        }

        const category = await Category.findById(id);

        //check if the category exists
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//POST/Create a new category
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        //check if all fields are filled
        if (!name) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        //add category to the database
        const category = new Category(req.body);
        await category.save();

        //201 - created
         res.status(201).json(category);
    } catch (error) {
        //400 - bad request
        res.status(400).json({ message: error.message });
    }
};

//DELETE a category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        //check if the id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Category not found(Invalid ID)" });
        }

        const category = await Category.findByIdAndDelete(id);

        //check if the category exists
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//UPDATE a category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        //check if the id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Category not found(Invalid ID)" });
        }

        const category = await Category.findByIdAndUpdate(id, req.body, { new: true });

        //check if the category exists
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getAllCategories,
    getCategory, 
    createCategory,
    deleteCategory,
    updateCategory
};