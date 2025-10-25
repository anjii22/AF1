const axios = require('axios');

const getExchangeRates = async (baseCurrency) => {
    try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        return response.data.rates; // Returns exchange rates for all currencies
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
};

module.exports = { getExchangeRates };
