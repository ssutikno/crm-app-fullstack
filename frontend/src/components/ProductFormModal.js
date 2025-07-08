import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductFormModal({ mode, product, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', price: '', status: 'Active', description: ''
    });
    // State for managing attachments
    const [attachments, setAttachments] = useState([]);
    const [newAttachment, setNewAttachment] = useState({ file_name: '', file_url: '#' });

    useEffect(() => {
        // Reset attachments and form data when the modal opens or the product changes
        setAttachments([]);
        setNewAttachment({ file_name: '', file_url: '#' });

        if (mode === 'edit' && product) {
            // Fetch full product details including attachments
            const fetchDetails = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${product.id}`);
                    setFormData(response.data);
                    setAttachments(response.data.attachments || []);
                } catch (error) {
                    console.error("Failed to fetch product details for edit.", error);
                }
            };
            fetchDetails();
        } else {
            // Reset form for 'create' mode
            setFormData({ name: '', sku: '', category: '', price: '', status: 'Active', description: '' });
        }
    }, [mode, product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleAddAttachment = async () => {
        if (!newAttachment.file_name) {
            alert('Please enter an attachment name.');
            return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/products/${product.id}/attachments`, newAttachment);
            // Add the new attachment to the list for immediate UI feedback
            setAttachments(prev => [...prev, response.data]);
            setNewAttachment({ file_name: '', file_url: '#' }); // Reset form
        } catch (error) {
            alert('Failed to add attachment.');
        }
    };
    
    const handleDeleteAttachment = async (attachmentId) => {
         if (!window.confirm("Are you sure you want to delete this attachment?")) return;
         try {
             await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${product.id}/attachments/${attachmentId}`);
             // Remove the attachment from the list for immediate UI feedback
             setAttachments(prev => prev.filter(att => att.id !== attachmentId));
         } catch (error) {
             alert('Failed to delete attachment.');
         }
    };

    if (!mode) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">{mode === 'create' ? 'Add New Product' : 'Edit Product'}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Product Name</label>
                                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">SKU</label>
                                    <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Category</label>
                                    <input type="text" className="form-control" name="category" value={formData.category} onChange={handleChange} />
                                </div>
                            </div>
                             <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Price</label>
                                    <input type="number" step="0.01" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                        <option value="Active">Active</option>
                                        <option value="Phasing Out">Phasing Out</option>
                                        <option value="Discontinued">Discontinued</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                            <hr/>
                            
                            {/* Attachment Management Section (only in edit mode) */}
                            {mode === 'edit' && (
                                <div>
                                    <h5>Manage Attachments</h5>
                                    <ul className="list-group mb-3">
                                        {attachments.map(file => (
                                            <li key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                {file.file_name}
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAttachment(file.id)}>Delete</button>
                                            </li>
                                        ))}
                                        {attachments.length === 0 && <li className="list-group-item">No attachments yet.</li>}
                                    </ul>
                                    <div className="input-group">
                                        <input type="text" className="form-control" placeholder="New attachment name..." value={newAttachment.file_name} onChange={e => setNewAttachment({ ...newAttachment, file_name: e.target.value })}/>
                                        <button type="button" className="btn btn-primary" onClick={handleAddAttachment}>Add</button>
                                    </div>
                                    <small className="form-text text-muted">File upload is simulated. This only adds a record to the database.</small>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                            <button type="submit" className="btn btn-primary">Save Product</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProductFormModal;