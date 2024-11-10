import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionTable.css';

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('March');

  const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };
  const monthValue = month ? monthMap[month] : null;
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        
        const response = await axios.get('http://localhost:5000/api/transactions', {
          params: { page, perPage, search, month:monthValue  },
        });
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
  
    fetchTransactions();
  }, [page, perPage, search, month, monthValue]);
  

  return (
    <div className="transaction-table-container">
      <h3>Transaction Dashboard</h3>
      <div className="transaction-controls">
        <input 
          type="text" 
          placeholder="Search transaction" 
          value={search}
          onChange={(e) => setSearch(e.target.value)} 
        />
        <select onChange={(e) => setMonth(e.target.value)} value={month}>
          <option value="">Select Month</option>
          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction._id}</td>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
              <td><img src={transaction.image} alt={transaction.title} width="50" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setPage(page > 1 ? page - 1 : 1)}>Previous</button>
        <span>Page No: {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default TransactionTable;
