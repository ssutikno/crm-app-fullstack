import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Navbar({ onMenuToggle }) {
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    
    const { user, logout, changeRole } = useAuth();
    const [roles, setRoles] = useState([]);
    const [currentRoleName, setCurrentRoleName] = useState('...');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(`${apiUrl}/api/roles`);
                setRoles(response.data);
            } catch (error) {
                console.error("Failed to fetch roles:", error);
            }
        };
        fetchRoles();
    }, []);
    
    useEffect(() => {
        if (user && roles.length > 0) {
            const roleDetails = roles.find(r => r.id === user.role);
            if (roleDetails) {
                setCurrentRoleName(roleDetails.name);
            }
        }
    }, [user, roles]);

    const handleRoleChange = (role) => {
        changeRole(role.id);
        setRoleDropdownOpen(false);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
            <div className="container-fluid">
                <button type="button" className="btn btn-primary btn-sm" id="menu-toggle" onClick={onMenuToggle}>
                    <i className="fas fa-bars"></i>
                </button>

                {/* THIS DIV IS UPDATED: removed the "collapse" class */}
                <div className="navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mt-2 mt-lg-0">
                        {/* Role Switcher Dropdown */}
                        <li className={`nav-item dropdown me-3 ${roleDropdownOpen ? 'show' : ''}`}>
                            <button 
                                type="button"
                                className="nav-link dropdown-toggle btn" 
                                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                            >
                                <i className="fas fa-user-shield me-1"></i> {currentRoleName}
                            </button>
                            <div className={`dropdown-menu dropdown-menu-end ${roleDropdownOpen ? 'show' : ''}`} >
                                {roles.map(role => (
                                    <button 
                                        key={role.id}
                                        type="button"
                                        className={`dropdown-item ${user?.role === role.id ? 'active' : ''}`} 
                                        onClick={() => handleRoleChange(role)}
                                    >
                                        {role.name}
                                    </button>
                                ))}
                            </div>
                        </li>

                        {/* User Profile Dropdown */}
                        <li className={`nav-item dropdown ${userDropdownOpen ? 'show' : ''}`}>
                            <button 
                                type="button"
                                className="nav-link dropdown-toggle btn" 
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            >
                                <i className="fas fa-user-circle me-1"></i> {user ? user.name : 'User'}
                            </button>
                            <div className={`dropdown-menu dropdown-menu-end ${userDropdownOpen ? 'show' : ''}`}>
                                <Link to="/profile" className="dropdown-item">Profile</Link>
                                <Link to="/settings" className="dropdown-item">Settings</Link>
                                <div className="dropdown-divider"></div>
                                <button type="button" className="dropdown-item" onClick={logout}>Logout</button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;