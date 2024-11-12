import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './TransactionTable.css';

const TransactionTable = ({selectedMonth}) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState('');

  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        
        const response = await axios.get('http://localhost:5000/api/transactions', {
          params: { page, perPage, search, month:selectedMonth  },
        });
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
  
    fetchTransactions();
  }, [page, perPage, search, selectedMonth]);
  

  return (
    <div className="transaction-table-container">

      <div className="transaction-controls">
        <input 
          type="text" 
          placeholder="Search transaction" 
          value={search}
          onChange={(e) => setSearch(e.target.value)} 
        />
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
        <span>PerPage: {perPage}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default TransactionTable;
