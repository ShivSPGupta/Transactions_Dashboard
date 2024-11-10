import React, { useState } from 'react';
import TransactionStatistics from './TransactionStatistics';
import TransactionBarChart from './TransactionBarChart';

const MainDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('March');

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
  

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div>
      <select onChange={handleMonthChange} value={selectedMonth}>
        {Object.keys(monthMap).map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>

      <TransactionStatistics selectedMonth={monthMap[selectedMonth]} />
      <TransactionBarChart selectedMonth={monthMap[selectedMonth]} />
    </div>
  );
};

export default MainDashboard;
