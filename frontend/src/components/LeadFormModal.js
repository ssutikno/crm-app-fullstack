import React, { useState, useEffect } from 'react';

function LeadFormModal({ mode, lead, onClose, onSave }) {
    // Form state includes all fields for a lead, including the description
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        source: '',
        score: 50,
        description: ''
    });

    // This effect runs when the modal opens to populate the form for editing or reset it for creating
    useEffect(() => {
        if (mode === 'edit' && lead) {
            setFormData({
                name: lead.name || '',
                company: lead.company || '',
                email: lead.email || '',
                phone: lead.phone || '',
                status: lead.status || 'New',
                source: lead.source || '',
                score: lead.score || 50,
                description: lead.description || ''
            });
        } else {
            // Reset the form for 'create' mode
            setFormData({ name: '', company: '', email: '', phone: '', status: 'New', source: '', score: 50, description: '' });
        }
    }, [mode, lead]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // Pass the form data to the parent page's save function
    };

    // Don't render the modal if it's not supposed to be open
    if (!mode) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">{mode === 'create' ? 'Add New Lead' : 'Edit Lead'}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Name</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Company</label>
                                    <input type="text" className="form-control" name="company" value={formData.company} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Phone</label>
                                    <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                        <option>New</option>
                                        <option>Contacted</option>
                                        <option>Qualified</option>
                                        <option>Lost</option>
                                        <option>Converted</option>
                                    </select>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Lead Source</label>
                                    <input type="text" className="form-control" name="source" value={formData.source} onChange={handleChange} />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Score (1-100)</label>
                                    <input type="number" className="form-control" name="score" value={formData.score} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description / Notes</label>
                                <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Lead</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LeadFormModal;