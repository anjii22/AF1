const express = require('express');

const { generateReport, 
        getSpendingTrends } = require('../controllers/reportController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', authMiddleware.protect, generateReport);  
router.get('/trends', authMiddleware.protect, getSpendingTrends);

module.exports = router;
