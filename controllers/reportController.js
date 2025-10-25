const Transaction = require('../models/transactionModel');

const generateReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period } = req.query; // daily, weekly, monthly

        const startDate = new Date();
        switch (period) {
            case 'daily': startDate.setDate(startDate.getDate() - 1); break;
            case 'weekly': startDate.setDate(startDate.getDate() - 7); break;
            case 'monthly': startDate.setMonth(startDate.getMonth() - 1); break;
            default: return res.status(400).json({ message: 'Invalid period' });
        }

        const report = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: startDate } } },
            { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            { $project: { _id: 0, category: "$categoryDetails.name", totalAmount: 1 } }
        ]);

        res.json({ report });
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error });
    }
};

const getSpendingTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period } = req.query; // daily, weekly, monthly

        const startDate = new Date();
        let format;
        switch (period) {
            case 'daily':
                startDate.setDate(startDate.getDate() - 30);
                format = "%Y-%m-%d"; 
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() - 365);
                format = "%Y-%U"; // Year-Week format
                break;
            case 'monthly':
                startDate.setFullYear(startDate.getFullYear() - 1);
                format = "%Y-%m";
                break;
            default: 
                return res.status(400).json({ message: 'Invalid period' });
        }

        const trends = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format, date: "$date" } },
                    totalSpent: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ trends });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching spending trends', error });
    }
};

module.exports = {
    generateReport,
    getSpendingTrends
};