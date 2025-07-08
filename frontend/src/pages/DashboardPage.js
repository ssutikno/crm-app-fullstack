import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SalesChart from '../components/SalesChart';


// A simple Stat Card component for the top row
const StatCard = ({ title, value, icon, color }) => (
    <div className={`card text-white bg-${color} shadow-sm`}>
        <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="card-title">{title}</h5>
                    <p className="card-text fs-2">{value}</p>
                </div>
                <i className={`fas ${icon} fa-3x opacity-50`}></i>
            </div>
        </div>
    </div>
);

function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                // const response = await axios.get(`${apiUrl}/api/dashboard/stats`);
                const [statsRes, chartRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/dashboard/stats`),
                    axios.get(`${apiUrl}/api/dashboard/sales-chart`)
                ]);
                setStats(statsRes.data);
                setChartData(chartRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <p>Loading Dashboard...</p>;
    }

    return (
        <div>
            <h1 className="mt-4">Dashboard</h1>
            <p className="lead">Here's a snapshot of your sales activity.</p>
            <div className="row">
                <div className="col-lg-3 col-md-6 mb-4">
                    <StatCard title="New Leads" value={stats?.newLeads} icon="fa-bullseye" color="primary" />
                </div>
                <div className="col-lg-3 col-md-6 mb-4">
                    <StatCard title="Open Opportunities" value={`$${parseInt(stats?.openDealsValue).toLocaleString()}`} icon="fa-chart-line" color="success" />
                </div>
                <div className="col-lg-3 col-md-6 mb-4">
                    <StatCard title="Tasks Due Today" value={stats?.tasksDueToday} icon="fa-tasks" color="warning" />
                </div>
                {/* NEW: Stat Card for Product Requests */}
                <div className="col-lg-3 col-md-6 mb-4">
                    <StatCard title="Open Product Requests" value={stats?.openProductRequests} icon="fa-inbox" color="info" />
                </div>
            </div>
            
            {chartData && <SalesChart chartData={chartData} />}
        </div>
    );
}

export default DashboardPage;