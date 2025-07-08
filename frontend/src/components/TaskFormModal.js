import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskFormModal({ isOpen, onClose, onSave }) {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [linkType, setLinkType] = useState('deal'); // 'deal' or 'customer'
    const [linkedEntityId, setLinkedEntityId] = useState('');
    
    const [linkableData, setLinkableData] = useState({ deals: [], customers: [] });

    // Fetch deals and customers when the modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchFormData = async () => {
                try {
                    const apiUrl = process.env.REACT_APP_API_URL;
                    const response = await axios.get(`${apiUrl}/api/tasks/form-data`);
                    setLinkableData(response.data);
                } catch (error) {
                    console.error("Failed to fetch form data:", error);
                }
            };
            fetchFormData();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const taskData = {
            title,
            due_date: dueDate,
            priority,
            deal_id: linkType === 'deal' ? linkedEntityId : null,
            customer_id: linkType === 'customer' ? linkedEntityId : null,
        };
        onSave(taskData);
    };

    if (!isOpen) return null;

    return (
         <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">Add New Task</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Title</label>
                                <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Due Date</label>
                                    <input type="date" className="form-control" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Priority</label>
                                    <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Link to:</label>
                                <div className="input-group">
                                    <select className="form-select" style={{ flex: '0 0 120px' }} value={linkType} onChange={e => setLinkType(e.target.value)}>
                                        <option value="deal">Deal</option>
                                        <option value="customer">Customer</option>
                                    </select>
                                    <select className="form-select" value={linkedEntityId} onChange={e => setLinkedEntityId(e.target.value)}>
                                        <option value="">Select...</option>
                                        {linkType === 'deal' ? (
                                            linkableData.deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                                        ) : (
                                            linkableData.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Task</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default TaskFormModal;