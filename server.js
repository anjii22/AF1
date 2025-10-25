require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');

//import services
const { processRecurringTransactions } = require('./services/transactionService');

//import routes
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Create an express app
const app = express();

//middleware
app.use(express.json());

//front end url connection
app.use(cors({
  origin: process.env.CLIENT_URL
}));

//log requests
app.use((req, res, next) => {
  console.log("A new request received at " + Date.now());
  console.log(req.path , req.method);
  next();
});

//routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/notifications', notificationRoutes);

// Schedule recurring transactions processing
cron.schedule('0 0 * * *', processRecurringTransactions);

// Database connection
mongoose.connect(process.env.MONGODB_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');

    //listen to port 4000
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })

  .catch(err => console.error('MongoDB connection error:', err)
);

