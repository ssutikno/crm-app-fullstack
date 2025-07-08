import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function QuotesListPage() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(`${apiUrl}/api/quotes`);
                setQuotes(response.data);
            } catch (error) {
                console.error("Failed to fetch quotes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuotes();
    }, []);


    if (loading) return <p>Loading quotes...</p>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h1>Quotes & Proposals</h1>
                <button className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>Create New Quote
                </button>
            </div>
            <p className="lead">Manage all quotes sent to customers.</p>

            <div className="card shadow-sm mt-4">
                <div className="card-body">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Quote ID</th>
                                <th>Deal Name</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(quote => (
                                <tr key={quote.id}>
                                    <td>{quote.id}</td>
                                    <td>{quote.deal_name}</td>
                                    <td>{quote.customer_name}</td>
                                    <td>{new Date(quote.created_at).toLocaleDateString()}</td>
                                    <td>${quote.total.toLocaleString()}</td>
                                    <td><span className="badge bg-info">{quote.status}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-secondary">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default QuotesListPage;