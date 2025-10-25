const Budget = require('../models/budgetModel');
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');

//GET all budgets
const getAllBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find().sort({ createdAt: 1 }).populate('category');
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//GET all user budgets
const getAllUserBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id }).populate('category');
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//GET a budget
const getBudget = async (req, res) => {
    try {
        const { id } = req.params;

        //check if the id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Budget not found(Invalid ID)" });
        }

        const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id }).populate('category');
        if (!budget) {
            return res.status(404).json({ error: "Budget not found" });
        }

        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 

//POST/Create a new budget
const createBudget = async (req, res) => {
    try {
        //const {  } = req.body;

        //check if all fields are filled
        // if (!title || !totalAmount) {
        //     return res.status(400).json({ message: "Please fill all the fields" });
        // }

        //add budget to the database
        const budget = await Budget.create({ ...req.body, user: req.user._id });

        //201 - created
        res.status(201).json(budget);
    } catch (error) {
        //400 - bad request
        res.status(400).json({ message: error.message });
    }
};

//DELETE a budget
const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;

        //check if the id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Budget not found(Invalid ID)" });
        }

        const budget = await Budget.findById(id);

        //check if the budget exists
        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        await Budget.findByIdAndDelete(id);

        res.json({ message: "Budget deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//UPDATE a budget
const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const amount = req.body;

        //check if the id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Budget not found(Invalid ID)" });
        }

        const budget = await Budget.findById(id);

        //check if the budget exists
        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }
        // Check if new amount exceeds current amount
        if (amount > budget.currentSpending) {
            await Notification.create({
                user: req.user._id,
                message: `Warning: You have spent more than 80% of your ${budget.period} budget for this category.`
            });
        }

        const updatedBudget = await Budget.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json(updatedBudget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getAllBudgets,
    getAllUserBudgets,
    getBudget,
    createBudget,
    deleteBudget,
    updateBudget
};
