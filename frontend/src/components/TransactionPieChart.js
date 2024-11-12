import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './TransactionPieChart.css'

// Register the chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const TransactionPieChart = ({ selectedMonth }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/transactions/categories`, {
        params: { month: selectedMonth }
      })
      .then((response) => {
        const categoryCounts = response.data;
        
        // Prepare the data for the pie chart
        const chartData = {
          labels: Object.keys(categoryCounts),
          datasets: [
            {
              label: 'Items per Category',
              data: Object.values(categoryCounts),
              backgroundColor: ['#FF6347', '#FFD700', '#32CD32', '#1E90FF', '#8A2BE2'], // Example colors
            },
          ],
        };
        setData(chartData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching category data:', error);
        setIsLoading(false);
      });
  }, [selectedMonth]);

 

  return (
    <div className="pie-chart-container">
      <h3>Category Distribution Pie Chart - {selectedMonth}</h3>
      {isLoading ? (
        <p>Loading data...</p>
      ) : (
          <Pie data={data} />
      )}
    </div>
  );
};

export default TransactionPieChart;
