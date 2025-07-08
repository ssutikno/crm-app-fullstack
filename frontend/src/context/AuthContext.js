import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Utility to set the auth token for all subsequent axios requests
const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                setAuthToken(token);
                try {
                    const apiUrl = process.env.REACT_APP_API_URL;
                    const userRes = await axios.get(`${apiUrl}/api/auth/me`);
                    const currentUser = userRes.data;
                    setUser(currentUser);

                    if (currentUser && currentUser.role) {
                        const permsRes = await axios.get(`${apiUrl}/api/auth/permissions/${currentUser.role}`);
                        setPermissions(permsRes.data);
                    }
                } catch (err) {
                    console.error("Token invalid, logging out.", err);
                    localStorage.removeItem('token');
                    setAuthToken(null);
                }
            }
            setLoading(false);
        };
        
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
            
            // NEW: Check if API is requesting password setup
            if (res.data.setupRequired) {
                navigate(`/setup/${res.data.userId}`);
                return;
            }

            localStorage.setItem('token', res.data.token);
            setAuthToken(res.data.token);

            // Reload user and permissions
            const userRes = await axios.get(`${apiUrl}/api/auth/me`);
            const currentUser = userRes.data;
            setUser(currentUser);

            if (currentUser && currentUser.role) {
                const permsRes = await axios.get(`${apiUrl}/api/auth/permissions/${currentUser.role}`);
                setPermissions(permsRes.data);
            }
            navigate('/dashboard');
            
        } catch (err) {
            console.error("Login failed", err);
            alert('Invalid credentials');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
        setPermissions([]);
        navigate('/login');
    };
    
    // NEW: Function to handle role changing
    const changeRole = async (roleId) => {
        if (!user || !roleId) return;

        // Update the user's role in the context state
        setUser(prevUser => ({ ...prevUser, role: roleId }));

        // Fetch the new set of permissions for the new role
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const permsRes = await axios.get(`${apiUrl}/api/auth/permissions/${roleId}`);
            setPermissions(permsRes.data);
        } catch (error) {
            console.error("Failed to switch roles:", error);
        }
    };

    // The value provided to consuming components
    const value = { user, permissions, loading, login, logout, changeRole };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};