import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TransactionBarChart = ({ selectedMonth }) => {
  const [priceRangeData, setPriceRangeData] = useState([]);

  useEffect(() => {
    if (selectedMonth) {
      axios
        .get('http://localhost:5000/api/transactions/price-range', { params: { month: selectedMonth } })
        .then((response) => setPriceRangeData(response.data))
        .catch((error) => console.error('Error fetching price range data:', error));
    }
  }, [selectedMonth]);

  const data = {
    labels: priceRangeData.map((range) => range.range),
    datasets: [
      {
        label: `Items in Price Range - ${selectedMonth}`,
        data: priceRangeData.map((range) => range.count),
        backgroundColor: '#4CAFEB',
        borderColor: '#009688',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: `Bar Chart Stats - ${selectedMonth}`,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="bar-chart-box">
      <h3>Bar Chart Stats - {selectedMonth}</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TransactionBarChart;
