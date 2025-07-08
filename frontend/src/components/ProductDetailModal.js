import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductDetailModal({ product, onClose }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (product) {
            const fetchDetails = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${product.id}`);
                    setDetails(response.data);
                } catch (error) {
                    console.error("Failed to fetch product details", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [product]);

    if (!product) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{product.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading ? <p>Loading details...</p> : (
                            <>
                                <div className="row">
                                    <div className="col-md-6"><p><strong>SKU:</strong> {details.sku}</p></div>
                                    <div className="col-md-6"><p><strong>Category:</strong> {details.category}</p></div>
                                </div>
                                <hr />
                                <h5>Description</h5>
                                <p>{details.description || 'No description available.'}</p>
                                <hr />
                                <h5>Attachments</h5>
                                <ul className="list-group">
                                    {details.attachments && details.attachments.map(file => (
                                        <li key={file.id} className="list-group-item">
                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                                <i className="fas fa-file-alt me-2"></i>{file.file_name}
                                            </a>
                                        </li>
                                    ))}
                                    {(!details.attachments || details.attachments.length === 0) && <li className="list-group-item">No attachments.</li>}
                                </ul>
                            </>
                        )}
                    </div>
                    <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Close</button></div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailModal;