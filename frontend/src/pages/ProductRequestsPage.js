import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductRequestDetailModal from '../components/ProductRequestDetailModal';
import ProductFormModal from '../components/ProductFormModal';

function ProductRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [viewingRequest, setViewingRequest] = useState(null);
    const [convertingRequest, setConvertingRequest] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.get(`${apiUrl}/api/product-requests`);
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch product requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleConvert = (request) => {
        setConvertingRequest(request); // Open the product form modal
        setViewingRequest(null);     // Close the detail modal
    };

    const handleSaveNewProduct = async (formData) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            // 1. Create the new product
            await axios.post(`${apiUrl}/api/products`, formData);
            
            // 2. Mark the original request as completed
            await axios.put(`${apiUrl}/api/product-requests/${convertingRequest.id}/convert`);
            
            alert(`Product "${formData.name}" created and request completed!`);
            fetchRequests(); // Refresh the list
        } catch (error) {
            alert('Failed to save new product.');
        } finally {
            setConvertingRequest(null);
        }
    };


    if (loading) return <p>Loading product requests...</p>;

    return (
        <div>
            <h1 className="mt-4">Product Requests</h1>
            <p className="lead">Review and manage new product requests from the sales team.</p>

            <div className="card shadow-sm mt-4">
                <div className="card-header"><h5 className="mb-0">Pending & Completed Requests</h5></div>
                <div className="card-body">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Requested Product</th><th>Requested By</th><th>Related Deal</th>
                                <th>Date</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td>{req.requested_product_name}</td>
                                    <td>{req.requested_by_name || 'N/A'}</td>
                                    <td>{req.deal_name || 'N/A'}</td>
                                    <td>{new Date(req.request_date).toLocaleDateString()}</td>
                                    <td><span className={`badge bg-${req.status === 'Pending' ? 'warning' : 'success'}`}>{req.status}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewingRequest(req)}>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingRequest && (
                <ProductRequestDetailModal 
                    request={viewingRequest}
                    onClose={() => setViewingRequest(null)}
                    onConvert={handleConvert}
                />
            )}
            
            {convertingRequest && (
                <ProductFormModal 
                    mode="create"
                    // Pre-populate the form with data from the request
                    product={{ 
                        name: convertingRequest.requested_product_name,
                        description: convertingRequest.specs,
                    }}
                    onClose={() => setConvertingRequest(null)}
                    onSave={handleSaveNewProduct}
                />
            )}
        </div>
    );
}

export default ProductRequestsPage;