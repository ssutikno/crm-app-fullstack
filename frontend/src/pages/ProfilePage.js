import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function ProfilePage() {
    const { user, loading } = useAuth();

    // State for the profile form
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    // State for the password change form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/profile/me`, profileData);
            alert('Profile updated successfully! Changes will be reflected on next login.');
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to update profile.');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return alert('New passwords do not match.');
        }
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/profile/me/password`, passwordData);
            alert('Password updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to update password.');
        }
    };

    if (loading || !user) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="mt-4">My Profile</h1>
            <p className="lead">Manage your personal information and password.</p>
            <div className="row">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-header"><h4>Edit Profile</h4></div>
                        <div className="card-body">
                            <form onSubmit={handleProfileSubmit}>
                                <div className="mb-3"><label className="form-label">Full Name</label><input type="text" name="name" className="form-control" value={profileData.name} onChange={handleProfileChange} /></div>
                                <div className="mb-3"><label className="form-label">Email Address</label><input type="email" name="email" className="form-control" value={profileData.email} onChange={handleProfileChange} /></div>
                                <button type="submit" className="btn btn-primary">Save Profile</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-header"><h4>Change Password</h4></div>
                        <div className="card-body">
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-3"><label className="form-label">Current Password</label><input type="password" name="currentPassword" className="form-control" value={passwordData.currentPassword} onChange={handlePasswordChange} required /></div>
                                <div className="mb-3"><label className="form-label">New Password</label><input type="password" name="newPassword" className="form-control" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength="6" /></div>
                                <div className="mb-3"><label className="form-label">Confirm New Password</label><input type="password" name="confirmPassword" className="form-control" value={passwordData.confirmPassword} onChange={handlePasswordChange} required /></div>
                                <button type="submit" className="btn btn-primary">Change Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;