import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserFormModal from '../components/UserFormModal';
import { useAuth } from '../context/AuthContext';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalMode, setModalMode] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const { user: loggedInUser } = useAuth();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSave = async (userData) => {
        try {
            if (modalMode === 'create') {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/users`, userData);
            } else if (modalMode === 'edit') {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${selectedUser.id}`, userData);
            }
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to save user.');
        } finally {
            setModalMode(null);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.msg || 'Failed to delete user.');
            }
        }
    };

    // NEW: Function to handle password reset API call
    const handleResetPassword = async (userId, newPassword) => {
        if (!window.confirm(`Are you sure you want to reset the password for this user?`)) return;
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}/reset-password`, { newPassword });
            alert('Password reset successfully!');
            setModalMode(null); // Close the modal
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to reset password.');
        }
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h1>User Management</h1>
                <button className="btn btn-primary" onClick={() => setModalMode('create')}><i className="fas fa-plus me-2"></i>Add New User</button>
            </div>
            <div className="card shadow-sm mt-4">
                <div className="card-body">
                    <table className="table table-hover">
                        <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td><td>{user.email}</td><td>{user.role_id}</td><td>{user.status}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setModalMode('edit'); setSelectedUser(user); }}><i className="fas fa-pencil-alt"></i></button>
                                        {loggedInUser.id !== user.id && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user.id)}><i className="fas fa-trash"></i></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {modalMode && (
                <UserFormModal 
                    mode={modalMode} 
                    user={selectedUser} 
                    onClose={() => setModalMode(null)} 
                    onSave={handleSave}
                    onResetPassword={handleResetPassword} // Pass the new function as a prop
                />
            )}
        </div>
    );
}

export default UserManagementPage;