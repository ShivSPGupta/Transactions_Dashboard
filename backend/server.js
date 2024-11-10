const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const Transaction = require('./models/Transaction');

const app = express();
app.use(cors());
const PORT = 5000;

// Connect to MongoDB
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


app.get('/api/transactions', async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = '', month } = req.query;
        const numericMonth = parseInt(month, 12); // Ensure month is a number
    
        const filter = {};
    
        // If a month is specified, filter by the month (1 = January, 12 = December)
        if (numericMonth >= 0 && numericMonth <= 11) {
          filter.$expr = { $eq: [{ $month: '$dateOfSale' }, numericMonth + 1] };
        }
    
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
      const numericMonth = parseInt(month, 10);
  
      const totalSales = await Transaction.aggregate([
        { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, numericMonth + 1] } } },
        { $group: { _id: null, totalSales: { $sum: '$price' }, totalSold: { $sum: 1 } } },
      ]);
  
      const notSoldItems = await Transaction.countDocuments({
        $expr: { $eq: [{ $month: '$dateOfSale' }, numericMonth + 1] },
        sold: false,
      });
  
      res.json({
        totalSales: totalSales[0]?.totalSales || 0,
        totalSold: totalSales[0]?.totalSold || 0,
        totalNotSold: notSoldItems,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Define route to get count by price range
  app.get('/api/transactions/price-range', async (req, res) => {
    try {
      const { month } = req.query;
      const numericMonth = parseInt(month, 10);
  
      const priceRanges = [
        [0, 100],
        [101, 200],
        [201, 300],
        [301, 400],
        [401, 500],
        [501, 600],
        [601, 700],
        [701, 800],
        [801, 900],
        [901, Infinity],
      ];
  
      const priceRangeCounts = await Promise.all(
        priceRanges.map(async ([min, max]) => {
          const count = await Transaction.countDocuments({
            $expr: { $eq: [{ $month: '$dateOfSale' }, numericMonth + 1] },
            price: { $gte: min, $lt: max === Infinity ? max : max + 1 },
          });
          return { range: `${min}-${max === Infinity ? 'above' : max}`, count };
        })
      );
  
      res.json(priceRangeCounts);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });