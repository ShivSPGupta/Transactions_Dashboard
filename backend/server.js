const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const Transaction = require('./models/Transaction');

const app = express();
app.use(cors());
const PORT = 5000;

mongoose.connect('mongodb://localhost:27017/transactions').then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));;

// Endpoint to initialize the database
app.get('/api/initialize', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Clear existing data
    await Transaction.deleteMany({});
    // Insert fetched data
    await Transaction.insertMany(transactions);

    res.status(200).json({ message: 'Database initialized with seed data.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initialize the database' });
  }
});

//for Getting Months
const monthNameToNumber = (monthName) => {
  const months = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
  };
  return months[monthName];
};

//Get Transactions by months
app.get('/api/transactions', async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = '', month } = req.query;

    const filter = {};

    // If a month is specified as a name, convert it to a number and filter by that month
    if (month) {
      const numericMonth = monthNameToNumber(month);
      if (numericMonth) {
        filter.$expr = { $eq: [{ $month: '$dateOfSale' }, numericMonth] };
      }
    };

    // If search is provided, add text search across relevant fields
    const searchAsNumber = parseFloat(search);
    if (!isNaN(searchAsNumber)) {
      // Search by price if search is a number
      filter.price = searchAsNumber;
    } else if (search) {
      // If search is a string, apply regex search to title and description
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination options
    const options = {
      skip: (page - 1) * perPage,
      limit: parseInt(perPage, 10),
    };

    // Fetch filtered transactions from the database
    const transactions = await Transaction.find(filter, null, options);

    // Count total documents for pagination
    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



//React Chart

// Define route to get monthly statistics
app.get('/api/transactions/stats', async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = monthNameToNumber(month); // Convert month name to correct month number

    // Fetch transactions for the specified month, regardless of the year
    const transactions = await Transaction.find({
      dateOfSale: { $exists: true },
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] }
    });

    // Calculate statistics
    const totalSales = transactions
      .filter(transaction => transaction.sold === true)
      .reduce((sum, transaction) => sum + (transaction.price || 0), 0);

    const totalSold = transactions.filter(transaction => transaction.sold === true).length;
    const totalNotSold = transactions.filter(transaction => transaction.sold === false).length;

    res.json({ totalSales, totalSold, totalNotSold });
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Define route to get count by price range bar
app.get('/api/transactions/price-range', async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = monthNameToNumber(month);

    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '100-500', min: 100, max: 500 },
      { range: '500-1000', min: 500, max: 1000 },
      { range: '1000-5000', min: 1000, max: 5000 },
      { range: '5000+', min: 5000, max: Infinity },
    ];

    const priceRangeData = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
          price: { $gte: range.min, $lt: range.max }
        });
        return { range: range.range, count };
      })
    );

    res.json(priceRangeData);
  } catch (error) {
    console.error('Error fetching price range data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});