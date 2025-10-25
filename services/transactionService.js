const Transaction = require('../models/transactionModel');
const cron = require('node-cron');

const processRecurringTransactions = async () => {
    try {
        const now = new Date();
        
        // Fetch all recurring transactions that need to be processed
        const transactions = await Transaction.find({
            isRecurring: true,
            $or: [
                { "recurringDetails.lastProcessed": { $exists: false } },
                { "recurringDetails.lastProcessed": { $lt: now } }
            ]
        });

        for (const transaction of transactions) {
            const { frequency, startDate, endDate, lastProcessed } = transaction.recurringDetails;

            if (endDate && new Date(endDate) < now) continue; // Skip expired transactions

            let shouldProcess = false;

            if (!lastProcessed) {
                shouldProcess = true;
            } else {
                const lastDate = new Date(lastProcessed);
                switch (frequency) {
                    case 'daily': shouldProcess = now - lastDate >= 24 * 60 * 60 * 1000; break;
                    case 'weekly': shouldProcess = now - lastDate >= 7 * 24 * 60 * 60 * 1000; break;
                    case 'monthly': shouldProcess = now.getMonth() !== lastDate.getMonth(); break;
                    case 'yearly': shouldProcess = now.getFullYear() !== lastDate.getFullYear(); break;
                }
            }

            if (shouldProcess) {
                await Transaction.create({
                    user: transaction.user,
                    type: transaction.type,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    category: transaction.category,
                    description: transaction.description,
                    tags: transaction.tags,
                    isRecurring: false, // New transactions should not be recurring
                    date: now
                });

                transaction.recurringDetails.lastProcessed = now;
                await transaction.save();
            }
        }

        console.log("Recurring transactions processed successfully.");
    } catch (error) {
        console.error("Error processing recurring transactions:", error);
    }
};

// Schedule this job to run every day at midnight
cron.schedule('0 0 * * *', processRecurringTransactions);

module.exports = { processRecurringTransactions };
