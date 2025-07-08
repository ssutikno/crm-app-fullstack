import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductRequestFormModal from './ProductRequestFormModal';

function DealDetailModal({ deal, onClose, onStageChange }) {
    const [details, setDetails] = useState(deal);
    const [loading, setLoading] = useState(true);
    const [allStages, setAllStages] = useState([]);
    const [selectedStage, setSelectedStage] = useState(deal.stage_name);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [searchedProducts, setSearchedProducts] = useState([]);

    const fetchDealDetails = useCallback(async () => {
        if (!deal?.id) return;
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const detailsRes = await axios.get(`${apiUrl}/api/deals/${deal.id}`);
            setDetails(detailsRes.data);
            setSelectedStage(detailsRes.data.stage_name);

            if (allStages.length === 0) {
                const stagesRes = await axios.get(`${apiUrl}/api/deal-stages`);
                setAllStages(stagesRes.data);
            }
        } catch (error) { 
            console.error("Failed to fetch deal details:", error);
        } finally { 
            setLoading(false); 
        }
    }, [deal.id, allStages.length]);

    useEffect(() => {
        fetchDealDetails();
    }, [fetchDealDetails]);

    useEffect(() => {
        if (productSearchTerm.length < 2) {
            setSearchedProducts([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`, { params: { search: productSearchTerm }});
                setSearchedProducts(res.data);
            } catch (error) {
                console.error("Failed to search products:", error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [productSearchTerm]);

    const handleAddProduct = async (product) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/deals/${deal.id}/products`, { productId: product.id, quantity: 1 });
            setProductSearchTerm('');
            setSearchedProducts([]);
            fetchDealDetails();
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to add product.');
        }
    };

    const handleUpdateQuantity = async (productId, quantity) => {
        const newQuantity = Math.max(1, Number(quantity));
        setDetails(prev => ({
            ...prev,
            products: prev.products.map(p => p.id === productId ? { ...p, quantity: newQuantity } : p)
        }));
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/deals/${deal.id}/products/${productId}`, { quantity: newQuantity });
        } catch (error) {
            alert('Failed to update quantity. Reverting changes.');
            fetchDealDetails();
        }
    };

    const handleRemoveProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to remove this product from the deal?")) return;
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/deals/${deal.id}/products/${productId}`);
            fetchDealDetails();
        } catch (error) {
            alert('Failed to remove product.');
        }
    };

    const handleSave = () => {
        onStageChange(details, selectedStage);
        onClose();
    };

    if (loading || !details) {
        return (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg"><div className="modal-content"><div className="modal-body text-center"><p>Loading Details...</p></div></div></div>
            </div>
        );
    }

    return (
        <>
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{details.name}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6 border-end">
                                    <div className="mb-3">
                                        <label htmlFor="stage-select" className="form-label fw-bold">Stage</label>
                                        <select id="stage-select" className="form-select" value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
                                            {allStages.map(stage => <option key={stage.id} value={stage.name}>{stage.name.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                    <p><strong>Value:</strong> ${details.value.toLocaleString()}</p>
                                    <p><strong>Expected Close Date:</strong> {new Date(details.close_date).toLocaleDateString()}</p>
                                    <p><strong>Owner:</strong> {details.owner_name}</p>
                                </div>
                                <div className="col-md-6">
                                    <h6>Associated Products</h6>
                                    {details.products?.map(p => (
                                        <div key={p.id} className="d-flex justify-content-between align-items-center mb-2">
                                            <span>{p.name}</span>
                                            <div className="input-group" style={{width: '150px'}}>
                                                <input type="number" className="form-control form-control-sm" value={p.quantity} onChange={e => handleUpdateQuantity(p.id, e.target.value)} />
                                                <button className="btn btn-sm btn-outline-danger" title="Remove Product" onClick={() => handleRemoveProduct(p.id)}><i className="fas fa-times"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!details.products || details.products.length === 0) && <p className="text-muted small">No products linked yet.</p>}
                                    <div className="mt-2 position-relative">
                                        <input type="text" className="form-control" placeholder="Search to add product..." value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} />
                                        {searchedProducts.length > 0 && (
                                            <ul className="list-group position-absolute w-100" style={{zIndex: 1056}}>
                                                {searchedProducts.map(p => <li key={p.id} className="list-group-item list-group-item-action" style={{cursor: 'pointer'}} onClick={() => handleAddProduct(p)}>{p.name}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <h5>Notes</h5>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{details.notes || 'No notes for this deal.'}</p>
                            <hr />
                            <h5>Attachments</h5>
                            <ul className="list-group list-group-flush">
                                {details.attachments && details.attachments.map(file => (
                                    <li key={file.id} className="list-group-item"><a href={process.env.REACT_APP_API_URL + file.file_url} target="_blank" rel="noopener noreferrer"><i className="fas fa-file-alt me-2"></i>{file.file_name}</a></li>
                                ))}
                                {/* THIS IS THE CORRECTED LINE */}
                                {(!details.attachments || details.attachments.length === 0) && <li className="list-group-item">No attachments found.</li>}
                            </ul>
                        </div>
                        <div className="modal-footer justify-content-between">
                             <button type="button" className="btn btn-info" onClick={() => setIsRequestModalOpen(true)}>Request New Product</button>
                            <div>
                                <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
                                <Link to="/quotes/new" state={{ deal: details }} className="btn btn-success me-2">Create Quote</Link>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isRequestModalOpen && <ProductRequestFormModal deal={details} onClose={() => setIsRequestModalOpen(false)} />}
        </>
    );
}

export default DealDetailModal;