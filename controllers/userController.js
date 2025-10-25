const User = require('../models/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//GET all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//GET a user by ID
const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "User not found(Invalid ID)" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
            
};

//POST/Create a new user
const createAdminUser = async (req, res) => {
    const { name, email, password } = req.body;

    //check if all fields are filled
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please fill all the fields" });
    }

    //add user to the database
    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        //201 - created
        res.status(201).json(user);
    } catch (error) {

        //400 - bad request
        res.status(400).json({ error: error.message });
    }
};

//DELETE a user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = await User.findByIdAndDelete({_id: id});

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH/UPDATE a user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = await User.findByIdAndUpdate({_id: id},{
            ...req.body
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUser,
    createAdminUser,
    deleteUser,
    updateUser
};