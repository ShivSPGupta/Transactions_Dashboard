import React, { useState } from 'react';
import TransactionStatistics from './TransactionStatistics';
import TransactionBarChart from './TransactionBarChart';
import TransactionTable from './TransactionTable';
const MainDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('March'); // Default month
  

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div>
      <h2>Transaction Dashboard</h2>
      
      <div>
        <label htmlFor="month">Select Month: </label>
        <select id="month" value={selectedMonth} onChange={handleMonthChange}>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>
      <TransactionTable selectedMonth={selectedMonth}/>
      <TransactionStatistics selectedMonth={selectedMonth} />
      <TransactionBarChart selectedMonth={selectedMonth} />
    </div>
  );
};

export default MainDashboard;
