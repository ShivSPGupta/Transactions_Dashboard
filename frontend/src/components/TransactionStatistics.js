import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransactionStatistics.css'

const TransactionStatistics = ({ selectedMonth }) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalSold: 0,
    totalNotSold: 0,
  });

  useEffect(() => {
    if (selectedMonth) {
      axios
        .get('http://localhost:5000/api/transactions/stats', { params: { month: selectedMonth } })
        .then((response) => setStats(response.data))
        .catch((error) => console.error('Error fetching stats:', error));
    }
  }, [selectedMonth]);

  return (
    <div className="statistics-box">
      <h3>Statistics - {selectedMonth}</h3>
      <p>Total Sale: {stats.totalSales}</p>
      <p>Total Sold Items: {stats.totalSold}</p>
      <p>Total Not Sold Items: {stats.totalNotSold}</p>
    </div>
  );
};

export default TransactionStatistics;
