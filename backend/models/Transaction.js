const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  sold: Boolean,
  dateOfSale: Date,
  image: String,
});

module.exports = mongoose.model('Transaction', TransactionSchema);
