import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
// NEW: Import Chart.js components to register them
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// NEW: Register the components needed for Bar charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function AnalyticsPage() {
    const [salesSummary, setSalesSummary] = useState(null);
    const [leadFunnel, setLeadFunnel] = useState(null);
    const [topReps, setTopReps] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const [summaryRes, funnelRes, repsRes, productsRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/analytics/sales-summary`),
                    axios.get(`${apiUrl}/api/analytics/lead-funnel`),
                    axios.get(`${apiUrl}/api/analytics/top-reps`),
                    axios.get(`${apiUrl}/api/analytics/top-products`),
                ]);
                
                setSalesSummary({
                    labels: summaryRes.data.labels,
                    datasets: [{ label: 'Sales per Month ($)', data: summaryRes.data.data, backgroundColor: 'rgba(75, 192, 192, 0.6)' }]
                });
                setLeadFunnel({
                    labels: funnelRes.data.map(item => item.status),
                    datasets: [{ label: '# of Leads', data: funnelRes.data.map(item => item.count), backgroundColor: 'rgba(153, 102, 255, 0.6)' }]
                });
                setTopReps(repsRes.data);
                setTopProducts(productsRes.data);
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading analytics...</p>;

    return (
        <div>
            <h1 className="mt-4">Analytics & Reports</h1>
            <p className="lead">Key insights into your CRM data.</p>
            <div className="row">
                <div className="col-lg-12 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header"><h5>Sales Summary (Last 12 Months)</h5></div>
                        <div className="card-body">{salesSummary && <Bar data={salesSummary} />}</div>
                    </div>
                </div>
                <div className="col-lg-12 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header"><h5>Lead Conversion Funnel</h5></div>
                        <div className="card-body">{leadFunnel && <Bar data={leadFunnel} options={{ indexAxis: 'y' }} />}</div>
                    </div>
                </div>
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header"><h5>Top 5 Sales Reps (by Value Won)</h5></div>
                        <table className="table table-hover mb-0">
                            <thead className="table-light"><tr><th>Representative</th><th>Total Value Won</th></tr></thead>
                            <tbody>{topReps.map(rep => (<tr key={rep.name}><td>{rep.name}</td><td>${parseInt(rep.total_won_value).toLocaleString()}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
                <div className="col-lg-6 mb-4">
                     <div className="card shadow-sm">
                        <div className="card-header"><h5>Top 5 Selling Products (in Quotes)</h5></div>
                        <table className="table table-hover mb-0">
                            <thead className="table-light"><tr><th>Product</th><th>Total Quantity Sold</th></tr></thead>
                            <tbody>{topProducts.map(prod => (<tr key={prod.name}><td>{prod.name}</td><td>{prod.total_quantity_sold}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;