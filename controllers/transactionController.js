const Transaction = require('../models/transactionModel');
const Budget = require('../models/budgetModel');
const Notification = require('../models/notificationModel');
const { getExchangeRates } = require('../services/currencyService');
const mongoose = require('mongoose');


//GET all transactions
const getAllTransactions = async (_req, res) => {
    try {
        const transaction = await Transaction.find({}).sort({ createdAt: -1 });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//GET user transactions
const getUserTransactions = async (req, res) => {
    try {
        const userID = req.user._id;

        const transactions = await Transaction.find({ user: userID }).sort({ createdAt: -1 });

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ error: "No transactions found" });
        }

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//GET a transaction by ID
const getTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
           return res.status(404).json({ error: "Transaction not found(Invalid ID)" });
        }
        const transaction = await Transaction.findById(id);
        
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//POST/Create a new transaction
const createTransaction = async (req, res) => {
    try {
        const { currency , amount } = req.body;
        const transaction = new Transaction({...req.body, user: req.user._id }); 

        if (currency !== 'USD') {
            const exchangeRates = await getExchangeRates(currency);
            if (!exchangeRates || !exchangeRates['USD']) {
                return res.status(400).json({ message: 'Invalid currency or exchange rates unavailable' });
            }
            transaction.amount = amount * exchangeRates['USD'];
        }

        // Check if user has a budget for this category
        const budget = await Budget.findOne({ user: req.user._id, category: transaction.category });

        if (!budget) {
            return res.status(400).json({ message: "No Budget has been set for this Transaction" });

        }else {

            if (transaction.type === "income") {
                budget.currentSpending -= transaction.amount;
                await budget.save();
            } else{
                budget.currentSpending += transaction.amount;

                // Alert if spending exceeds 80% of budget
                if (budget.currentSpending > 0.8 * budget.amount) {
                    console.log("80% of budget reached!.");

                    await Notification.create({
                        user: req.user._id,
                        message: `Warning: You have spent more than 80% of your ${budget.period} budget for this category.`
                    });
                }

                // Alert if spending exceeds budget
                if (budget.currentSpending >= budget.amount && budget.alertsEnabled) {
                    console.log("Budget exceeded!.");

                    // If spending exceeds budget, send a notification
                    await Notification.create({
                        user: req.user._id,
                        message: `You have exceeded your budget for ${budget.category}`
                    });

                }

                await budget.save();
            }

            // Save the transaction
            await transaction.save();

        }
        
        //201 - created
        res.status(201).json(transaction);
    } catch (error) {

        //400 - bad request
        res.status(400).json({ error: error.message });
    }
};

//DELETE a transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {  
            return res.status(404).json({ error: "Transaction not found" });
        }
        
        //conditions
        const savedTransaction = await Transaction.findById(id);
        const savedBudget = await Budget.findOne({ user: savedTransaction.user , category: savedTransaction.category });

        if (savedBudget) {
            if (savedTransaction.type === "income") {
                savedBudget.currentSpending += savedTransaction.amount;
            } else {
                savedBudget.currentSpending -= savedTransaction.amount;
            }
            await savedBudget.save();
        }

        //delete the transaction
        const transaction = await Transaction.findByIdAndDelete({_id: id});

        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH/UPDATE a transaction
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { type , amount , category } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Invalid Transaction ID!" });
        }

        if (currency !== 'USD') {
            const exchangeRates = await getExchangeRates(currency);
            if (!exchangeRates || !exchangeRates['USD']) {
                return res.status(400).json({ message: 'Invalid currency or exchange rates unavailable' });
            }
            amount = amount * exchangeRates['USD'];
        }

        //conditions
        const savedTransaction = await Transaction.findById(id);
        const savedBudget = await Budget.findOne({ user: savedTransaction.user , category: savedTransaction.category });
        const requestedBudget = await Budget.findOne({ user: req.user._id , category: category });

        if (savedTransaction.type === "income") {
            savedBudget.currentSpending += savedTransaction.amount;
            await savedBudget.save();
        } else{
            savedBudget.currentSpending -= savedTransaction.amount;
            await savedBudget.save();
        }

        if (type === "income") {
            requestedBudget.currentSpending -= amount;
            await requestedBudget.save();
        } else{
            requestedBudget.currentSpending += amount;

            // Alert if spending exceeds 80% of budget
            if (requestedBudget.currentSpending > 0.8 * requestedBudget.amount) {
                await Notification.create({
                    user: req.user._id,
                    message: `Warning: You have spent more than 80% of your ${requestedBudget.period} budget for this category.`
                });
            }

            // Alert if spending exceeds budget
            if (requestedBudget.currentSpending >= requestedBudget.amount && requestedBudget.alertsEnabled) {
                console.log("Budget exceeded!.");

                // If spending exceeds budget, send a notification
                await Notification.create({
                    user: req.user._id,
                    message: `You have exceeded your budget for ${requestedBudget.category}`
                });
            }

            await requestedBudget.save();
        }

        //update the transaction
        const transaction = await Transaction.findByIdAndUpdate({_id: id},{
            ...req.body
        });

        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllTransactions,
    getUserTransactions,
    getTransaction,
    createTransaction,
    deleteTransaction,
    updateTransaction
};