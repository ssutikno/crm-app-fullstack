import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components Chart.js needs
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SalesChart({ chartData }) {
    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Sales ($)',
                data: chartData.data,
                fill: true,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sales This Month',
            },
        },
    };

    return (
         <div className="card shadow-sm mt-4">
             <div className="card-body">
                 <Line data={data} options={options} />
             </div>
         </div>
    );
}

export default SalesChart;