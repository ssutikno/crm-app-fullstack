import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

// A helper component to conditionally render links
const ProtectedNavLink = ({ to, permission, children }) => {
    const { permissions } = useAuth();
    if (!permissions.includes(permission)) {
        return null; // Don't render the link if permission is missing
    }
    return (
        <NavLink to={to} className="list-group-item list-group-item-action bg-transparent text-light">
            {children}
        </NavLink>
    );
};

function Sidebar() {
    return (
        <div className="bg-dark" id="sidebar-wrapper">
            <div className="sidebar-heading text-center py-4 text-light fs-4 fw-bold text-uppercase border-bottom">
                <i className="fas fa-headset me-2"></i>CRM v2.0
            </div>
            <div className="list-group list-group-flush my-3">
                <ProtectedNavLink to="/dashboard" permission="dashboard">
                    <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                </ProtectedNavLink>
                <ProtectedNavLink to="/leads" permission="leads">
                    <i className="fas fa-bullseye me-2"></i>Leads
                </ProtectedNavLink>
                <ProtectedNavLink to="/pipeline" permission="pipeline">
                    <i className="fas fa-chart-line me-2"></i>Sales Pipeline
                </ProtectedNavLink>
                <ProtectedNavLink to="/quotes" permission="quotes">
                    <i className="fas fa-file-invoice-dollar me-2"></i>Quotes
                </ProtectedNavLink>
                <ProtectedNavLink to="/products" permission="products">
                    <i className="fas fa-box-open me-2"></i>Product Catalog
                </ProtectedNavLink>
                <ProtectedNavLink to="/product-requests" permission="product-requests">
                    <i className="fas fa-inbox me-2"></i>Product Requests
                </ProtectedNavLink>
                <ProtectedNavLink to="/customers" permission="customers">
                    <i className="fas fa-users me-2"></i>Customers
                </ProtectedNavLink>
                <ProtectedNavLink to="/tasks" permission="tasks">
                    <i className="fas fa-tasks me-2"></i>Tasks & Activities
                </ProtectedNavLink>
                <ProtectedNavLink to="/analytics" permission="analytics">
                    <i className="fas fa-chart-pie me-2"></i>Analytics
                </ProtectedNavLink>
                <ProtectedNavLink to="/users" permission="users">
                    <i className="fas fa-users-cog me-2"></i>User Management
                </ProtectedNavLink>
            </div>
        </div>
    );
}

export default Sidebar;