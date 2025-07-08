import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function NewQuotePage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [deals, setDeals] = useState([]);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [products, setProducts] = useState([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [lineItems, setLineItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // This effect checks if a deal was passed from the previous page (e.g., the Deal Detail Modal)
    useEffect(() => {
        const dealFromState = location.state?.deal;
        if (dealFromState) {
            // If so, populate the page immediately
            setSelectedDeal(dealFromState);
            if (dealFromState.products) {
                const initialLineItems = dealFromState.products.map(p => ({
                    product_id: p.id,
                    name: p.name,
                    quantity: 1,
                    price_at_time: p.price
                }));
                setLineItems(initialLineItems);
            }
            setLoading(false);
        } else {
            // If no deal was passed, fetch all deals for the dropdown selector
            const fetchDeals = async () => {
                try {
                    const apiUrl = process.env.REACT_APP_API_URL;
                    const response = await axios.get(`${apiUrl}/api/deals`);
                    const allDeals = Object.values(response.data).flat();
                    setDeals(allDeals);
                } catch (error) {
                    console.error("Failed to fetch deals:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDeals();
        }
    }, [location.state]);

    // This effect fetches products when the user types in the search box
    useEffect(() => {
        if (productSearchTerm.length < 2) {
            setProducts([]);
            return;
        }

        const fetchProducts = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(`${apiUrl}/api/products`, { params: { search: productSearchTerm } });
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch products", error);
            }
        };

        const timerId = setTimeout(fetchProducts, 500);
        return () => clearTimeout(timerId);
    }, [productSearchTerm]);

    const handleSelectDeal = async (dealId) => {
        if (!dealId) {
            setSelectedDeal(null);
            return;
        }
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/api/deals/${dealId}`);
        setSelectedDeal(response.data);
    };
    
    const addLineItem = (product) => {
        if (lineItems.some(item => item.product_id === product.id)) return;
        setLineItems(prev => [...prev, { product_id: product.id, name: product.name, quantity: 1, price_at_time: product.price }]);
        setProductSearchTerm('');
        setProducts([]);
    };

    const updateQuantity = (productId, quantity) => {
        const newQuantity = Math.max(1, Number(quantity));
        setLineItems(prev => prev.map(item => item.product_id === productId ? { ...item, quantity: newQuantity } : item));
    };

    const removeItem = (productId) => {
        setLineItems(prev => prev.filter(item => item.product_id !== productId));
    };

    // Memoized calculation for quote totals
    const { subtotal, tax, total } = useMemo(() => {
        const sub = lineItems.reduce((acc, item) => acc + (item.quantity * item.price_at_time), 0);
        const taxAmount = sub * 0.11; // Assuming 11% tax rate
        const totalAmount = sub + taxAmount;
        return { subtotal: sub, tax: taxAmount, total: totalAmount };
    }, [lineItems]);

    const handleSaveQuote = async () => {
        if (lineItems.length === 0) {
            alert("Please add at least one line item to the quote.");
            return;
        }
        const quoteData = {
            deal_id: selectedDeal.id,
            customer_id: selectedDeal.customer_id,
            status: 'Draft',
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            lineItems: lineItems.map(item => ({ product_id: item.product_id, quantity: item.quantity, price_at_time: item.price_at_time }))
        };

        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.post(`${apiUrl}/api/quotes`, quoteData);
            alert('Quote created successfully!');
            navigate('/quotes');
        } catch (error) {
            console.error("Failed to save quote:", error);
            alert('Error saving quote.');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="mt-4">Create New Quote</h1>

            {!selectedDeal ? (
                <div className="card shadow-sm">
                    <div className="card-header fs-5">Step 1: Select a Deal</div>
                    <div className="card-body">
                        <label className="form-label">Choose a deal to create a quote for:</label>
                        <select className="form-select" defaultValue="" onChange={(e) => handleSelectDeal(e.target.value)}>
                            <option value="" disabled>Select a deal...</option>
                            {deals.map(deal => <option key={deal.id} value={deal.id}>{deal.name}</option>)}
                        </select>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="alert alert-info">Creating quote for deal: <strong>{selectedDeal.name}</strong></div>
                    
                    <div className="card shadow-sm mb-4">
                        <div className="card-header fs-5">Step 2: Add Products</div>
                        <div className="card-body">
                            <label htmlFor="product-search" className="form-label">Search for products to add:</label>
                            <input
                                id="product-search"
                                type="text"
                                className="form-control"
                                placeholder="Start typing to search products by name or SKU..."
                                value={productSearchTerm}
                                onChange={e => setProductSearchTerm(e.target.value)}
                            />
                            {products.length > 0 && (
                                <ul className="list-group mt-2">
                                    {products.map(p => <li key={p.id} className="list-group-item list-group-item-action" style={{cursor: 'pointer'}} onClick={() => addLineItem(p)}>{p.name} - ${p.price}</li>)}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header fs-5">Step 3: Review Line Items</div>
                        <div className="card-body">
                            <table className="table">
                                <thead className="table-light"><tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Line Total</th><th>Action</th></tr></thead>
                                <tbody>
                                    {lineItems.map(item => (
                                        <tr key={item.product_id}>
                                            <td>{item.name}</td>
                                            <td><input type="number" className="form-control" style={{width: '80px'}} value={item.quantity} onChange={(e) => updateQuantity(item.product_id, e.target.value)} /></td>
                                            <td>${Number(item.price_at_time).toFixed(2)}</td>
                                            <td>${(item.quantity * item.price_at_time).toFixed(2)}</td>
                                            <td><button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item.product_id)}><i className="fas fa-trash"></i></button></td>
                                        </tr>
                                    ))}
                                    {lineItems.length === 0 && <tr><td colSpan="5" className="text-center">No products added yet.</td></tr>}
                                </tbody>
                                {lineItems.length > 0 && (
                                    <tfoot>
                                        <tr><td colSpan="3" className="text-end">Subtotal:</td><td colSpan="2">${subtotal.toFixed(2)}</td></tr>
                                        <tr><td colSpan="3" className="text-end">Tax (11%):</td><td colSpan="2">${tax.toFixed(2)}</td></tr>
                                        <tr><td colSpan="3" className="text-end fw-bold">Total:</td><td colSpan="2" className="fw-bold">${total.toFixed(2)}</td></tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                        <button className="btn btn-primary btn-lg" onClick={handleSaveQuote}>Save Quote</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewQuotePage;