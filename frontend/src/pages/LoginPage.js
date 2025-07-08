import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('john.doe@example.com');
    const [password, setPassword] = useState('password123');

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="card shadow-lg" style={{ width: '400px' }}>
                <div className="card-body p-5">
                    <h3 className="card-title text-center mb-4">CRM Login</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required />
                        </div>
                        <div className="mb-3">
                            <label>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;