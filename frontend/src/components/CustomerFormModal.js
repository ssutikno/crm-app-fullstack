import React, { useState, useEffect } from 'react';

function CustomerFormModal({ mode, customer, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        address: '',
        city: '',
        country: '',
        website: '',
        notes: ''
    });

    useEffect(() => {
        if (mode === 'edit' && customer) {
            setFormData({
                name: customer.name || '',
                industry: customer.industry || '',
                address: customer.address || '',
                city: customer.city || '',
                country: customer.country || '',
                website: customer.website || '',
                notes: customer.notes || ''
            });
        } else {
            // Reset form for 'create' mode
            setFormData({
                name: '', industry: '', address: '', city: '', country: '', website: '', notes: ''
            });
        }
    }, [mode, customer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!mode) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">{mode === 'create' ? 'Add New Customer' : 'Edit Customer'}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Customer Name</label>
                                <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="industry" className="form-label">Industry</label>
                                <input type="text" className="form-control" id="industry" name="industry" value={formData.industry} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="address" className="form-label">Address</label>
                                <input type="text" className="form-control" id="address" name="address" value={formData.address} onChange={handleChange} />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="city" className="form-label">City</label>
                                    <input type="text" className="form-control" id="city" name="city" value={formData.city} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="country" className="form-label">Country</label>
                                    <input type="text" className="form-control" id="country" name="country" value={formData.country} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="website" className="form-label">Website</label>
                                <input type="url" className="form-control" id="website" name="website" value={formData.website} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="notes" className="form-label">Notes / Description</label>
                                <textarea className="form-control" id="notes" name="notes" rows="4" value={formData.notes} onChange={handleChange}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CustomerFormModal;