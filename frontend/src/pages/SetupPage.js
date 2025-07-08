import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SetupPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { userId } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.post(`${apiUrl}/api/auth/complete-setup`, { userId, password });
            alert("Setup complete! Please log in with your new password.");
            navigate('/login');
        } catch (error) {
            alert("Failed to complete setup.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="card shadow-lg" style={{ width: '450px' }}>
                <div className="card-body p-5">
                    <h3 className="card-title text-center mb-4">Create Admin Password</h3>
                    <p className="text-muted text-center">As this is your first login, please create a secure password for the admin account.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label>New Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required minLength="6" />
                        </div>
                        <div className="mb-3">
                            <label>Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-control" required />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary">Set Password and Finish</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SetupPage;