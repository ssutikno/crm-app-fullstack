import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import axios from 'axios';
import SalesChart from '../components/SalesChart';

// UPDATED: StatCard is now wrapped in a Link and accepts a 'linkTo' prop
const StatCard = ({ title, value, icon, color, linkTo = "#" }) => (
    <Link to={linkTo} className="text-decoration-none">
        <div className={`card text-white bg-${color} shadow-sm h-100`}>
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
    </Link>
);

function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const apiUrl = process.env.REACT_APP_API_URL;
            try {
                const [statsRes, chartRes, activityRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/dashboard/stats`),
                    axios.get(`${apiUrl}/api/dashboard/sales-chart`),
                    axios.get(`${apiUrl}/api/dashboard/recent-activity`)
                ]);
                setStats(statsRes.data);
                setChartData(chartRes.data);
                setActivities(activityRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading Dashboard...</p>;

    return (
        <div>
            <h1 className="mt-4">Dashboard</h1>
            <p className="lead">Here's a snapshot of your sales activity.</p>
            
            {/* Stat Cards now have the 'linkTo' prop */}
            <div className="row">
                <div className="col-lg-3 col-md-6 mb-4">
                    <StatCard title="New Leads" value={stats?.newLeads} icon="fa-bullseye" color="primary" linkTo="/leads" />
                </div>
                <div className="col-lg-3 col-md-6 mb-4">
                    <StatCard title="Open Opportunities" value={`$${parseInt(stats?.openDealsValue).toLocaleString()}`} icon="fa-chart-line" color="success" linkTo="/pipeline" />
                </div>
                <div className="col-lg-3 col-md-6 mb-4">
                    <StatCard title="Tasks Due Today" value={stats?.tasksDueToday} icon="fa-tasks" color="warning" linkTo="/tasks" />
                </div>
                <div className="col-lg-3 col-md-6 mb-4">
                    <StatCard title="Open Product Requests" value={stats?.openProductRequests} icon="fa-inbox" color="info" linkTo="/product-requests" />
                </div>
            </div>
            
            <div className="row">
                <div className="col-lg-7 mb-4">
                    {chartData && <SalesChart chartData={chartData} />}
                </div>
                <div className="col-lg-5 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5><i className="fas fa-clipboard-list me-2"></i>Recent Activity</h5>
                        </div>
                        <div className="list-group list-group-flush">
                            {activities.map((activity, index) => (
                                <div key={index} className="list-group-item">
                                    <div className="d-flex w-100 justify-content-start align-items-center">
                                        <i className={`fas ${activity.icon} ${activity.color} fa-2x me-3`}></i>
                                        <div>
                                            <p className="mb-0">{activity.description}</p>
                                            <small className="text-muted">{new Date(activity.date).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && <div className="list-group-item">No recent activity.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;