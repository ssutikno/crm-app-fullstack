import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function QuotesListPage() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalQuotes, setTotalQuotes] = useState(0);

    useEffect(() => {
        const fetchQuotes = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(`${apiUrl}/api/quotes`, {
                    params: { 
                        search: searchTerm, 
                        sortBy: sortConfig.key, 
                        direction: sortConfig.direction, 
                        page: currentPage, 
                        limit: itemsPerPage 
                    }
                });
                setQuotes(response.data.quotes);
                setTotalQuotes(response.data.totalCount);
            } catch (error) {
                console.error("Failed to fetch quotes:", error);
            } finally {
                setLoading(false);
            }
        };
        const timerId = setTimeout(fetchQuotes, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm, sortConfig, currentPage, itemsPerPage]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') { 
            direction = 'desc'; 
        }
        setSortConfig({ key, direction });
    };

    // Helper function to format currency
    const formatCurrency = (value) => {
        // Uses Indonesian locale for dot-as-thousand-separator formatting
        return `Rp. ${Number(value).toLocaleString('id-ID')}`;
    };

    const totalPages = Math.ceil(totalQuotes / itemsPerPage);

    if (loading) return <p>Loading quotes...</p>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h1>Quotes & Proposals</h1>
                <Link to="/quotes/new" className="btn btn-primary"><i className="fas fa-plus me-2"></i>Create New Quote</Link>
            </div>
            <p className="lead">Manage all quotes sent to customers.</p>
            <input type="text" className="form-control w-25 mb-3" placeholder="Search quotes..." onChange={(e) => setSearchTerm(e.target.value)} />

            <div className="card shadow-sm mt-4">
                <div className="card-body">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th onClick={() => requestSort('id')} style={{ cursor: 'pointer' }}>Quote ID ▾</th>
                                <th onClick={() => requestSort('deal_name')} style={{ cursor: 'pointer' }}>Deal Name ▾</th>
                                <th onClick={() => requestSort('customer_name')} style={{ cursor: 'pointer' }}>Customer ▾</th>
                                <th onClick={() => requestSort('created_at')} style={{ cursor: 'pointer' }}>Date ▾</th>
                                {/* UPDATED: Added text-end for right alignment */}
                                <th onClick={() => requestSort('total')} style={{ cursor: 'pointer' }} className="text-end">Total ▾</th>
                                <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>Status ▾</th>
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
                                    {/* UPDATED: Applied currency formatting and right alignment */}
                                    <td className="text-end">{formatCurrency(quote.total)}</td>
                                    <td><span className="badge bg-info">{quote.status}</span></td>
                                    <td><Link to={`/quotes/${quote.id}`} className="btn btn-sm btn-outline-secondary">View Details</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <nav>
                    <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Previous</button></li>
                        <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Next</button></li>
                    </ul>
                </nav>
                <span className="text-muted">Page {currentPage} of {totalPages}</span>
            </div>
        </div>
    );
}

export default QuotesListPage;