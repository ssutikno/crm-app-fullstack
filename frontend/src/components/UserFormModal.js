import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserFormModal({ mode, user, onClose, onSave, onResetPassword }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role_id: 'sales', status: 'Active' });
    const [roles, setRoles] = useState([]);
    
    // State for password reset UI
    const [showReset, setShowReset] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        // Fetch all available roles to populate the dropdown
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/roles`);
                setRoles(response.data);
            } catch (error) {
                console.error("Failed to fetch roles:", error);
            }
        };
        fetchRoles();

        // If in 'edit' mode, populate the form with the selected user's data
        if (mode === 'edit' && user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '', // Password is not edited here for security
                role_id: user.role_id || 'sales',
                status: user.status || 'Active'
            });
        } else {
            // Reset form for 'create' mode
            setFormData({ name: '', email: '', password: '', role_id: 'sales', status: 'Active' });
        }
        
        // Reset password fields every time the modal opens
        setShowReset(false);
        setNewPassword('');
    }, [mode, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Don't send the password field on a regular edit operation
        const dataToSave = { ...formData };
        if (mode === 'edit') {
            delete dataToSave.password;
        }
        onSave(dataToSave);
    };

    const handlePasswordReset = () => {
        if (!newPassword || newPassword.length < 6) {
            alert('Please enter a new password with at least 6 characters.');
            return;
        }
        onResetPassword(user.id, newPassword);
    };

    // Don't render anything if the modal isn't supposed to be open
    if (!mode) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">{mode === 'create' ? 'Add New User' : 'Edit User'}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            
                            {/* Only show password field when creating a new user */}
                            {mode === 'create' && (
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
                                </div>
                            )}

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Role</label>
                                    <select className="form-select" name="role_id" value={formData.role_id} onChange={handleChange}>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Password Reset Section (only in edit mode) */}
                            {mode === 'edit' && (
                                <>
                                    <hr />
                                    {!showReset ? (
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowReset(true)}>Reset Password</button>
                                    ) : (
                                        <div>
                                            <h5>Reset Password</h5>
                                            <div className="input-group">
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    placeholder="Enter new password (min 6 characters)"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                                <button type="button" className="btn btn-success" onClick={handlePasswordReset}>Save New Password</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save User Details</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserFormModal;