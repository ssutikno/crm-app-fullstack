import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductRequestDetailModal({ request, onClose, onConvert }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/product-requests/${request.id}`);
                setDetails(response.data);
            } catch (error) {
                console.error("Failed to fetch request details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [request.id]);

    if (loading || !details) return <p>Loading details...</p>;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Review Request: {details.requested_product_name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <h5>Specifications & Requirements</h5>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{details.specs}</p>
                        <hr />
                        <h5>Attachments</h5>
                        <ul className="list-group">
                            {details.attachments.map(file => (
                                <li key={file.id} className="list-group-item">
                                    <a href={process.env.REACT_APP_API_URL + file.file_url} target="_blank" rel="noopener noreferrer">
                                        <i className="fas fa-file-alt me-2"></i>{file.file_name}
                                    </a>
                                </li>
                            ))}
                            {details.attachments.length === 0 && <li className="list-group-item">No attachments.</li>}
                        </ul>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        {details.status === 'Pending' && (
                            <button type="button" className="btn btn-success" onClick={() => onConvert(details)}>Approve & Convert to Product</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductRequestDetailModal;