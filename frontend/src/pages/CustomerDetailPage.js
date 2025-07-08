import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReadOnlyDealModal from '../components/ReadOnlyDealModal'; // Import the new modal

function CustomerDetailPage() {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    // State for deal pagination
    const [currentDealPage, setCurrentDealPage] = useState(1);
    const dealsPerPage = 5;

    // State for the deal detail modal
    const [selectedDeal, setSelectedDeal] = useState(null);

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(`${apiUrl}/api/customers/${id}`);
                setCustomer(response.data);
            } catch (error) {
                console.error("Failed to fetch customer details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomerDetails();
    }, [id]);

    // Memoized calculation for paginating deals
    const paginatedDeals = useMemo(() => {
        if (!customer?.deals) return [];
        // The API already sorts by newest, so we just need to slice
        const startIndex = (currentDealPage - 1) * dealsPerPage;
        const endIndex = startIndex + dealsPerPage;
        return customer.deals.slice(startIndex, endIndex);
    }, [customer, currentDealPage, dealsPerPage]);

    const totalDealPages = customer ? Math.ceil(customer.deals.length / dealsPerPage) : 0;

    if (loading) return <p>Loading customer details...</p>;
    if (!customer) return <div className="alert alert-danger">Customer not found.</div>;

    return (
        <div>
            {/* Breadcrumb and h1 */}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/customers">Customers</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{customer.name}</li>
                </ol>
            </nav>
            <h1 className="mt-2">{customer.name}</h1>
            <p className="lead">A detailed overview of the customer account.</p>

            <div className="row mt-4">
                {/* --- Left Column (Details, Notes, Contacts) --- */}
                <div className="col-lg-5 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header"><h5>Account Details</h5></div>
                        <div className="card-body">
                            <p><strong>Industry:</strong> {customer.industry || 'N/A'}</p>
                            <p><strong>Website:</strong> <a href={customer.website} target="_blank" rel="noopener noreferrer">{customer.website}</a></p>
                            <hr />
                            <p className="mb-1"><strong>Address:</strong></p>
                            <address className="ms-3">
                                {customer.address}<br />
                                {customer.city}, {customer.country}
                            </address>
                        </div>
                    </div>
                    <div className="card shadow-sm mt-4">
                        <div className="card-header"><h5>Notes / Description</h5></div>
                        <div className="card-body">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{customer.notes || 'No notes available.'}</p>
                        </div>
                    </div>
                    <div className="card shadow-sm mt-4">
                        <div className="card-header"><h5>Contacts</h5></div>
                        <ul className="list-group list-group-flush">
                            {customer.contacts && customer.contacts.map(contact => (
                                <li key={contact.id} className="list-group-item">{contact.name} <br/><small className="text-muted">{contact.email}</small></li>
                            ))}
                            {(!customer.contacts || customer.contacts.length === 0) && <li className="list-group-item">No contacts found.</li>}
                        </ul>
                    </div>
                </div>

                {/* --- Right Column (Deals, Attachments) --- */}
                <div className="col-lg-7">
                    <div className="card shadow-sm">
                        <div className="card-header"><h5>Associated Deals</h5></div>
                        <div className="card-body">
                            <table className="table table-hover">
                                <thead><tr><th>Deal Name</th><th>Value</th><th>Stage</th></tr></thead>
                                <tbody>
                                    {paginatedDeals.map(deal => (
                                        <tr key={deal.id} onClick={() => setSelectedDeal(deal)} style={{ cursor: 'pointer' }}>
                                            <td>{deal.name}</td>
                                            <td>${deal.value.toLocaleString()}</td>
                                            <td><span className="badge bg-primary">{deal.stage_name}</span></td>
                                        </tr>
                                    ))}
                                    {(!customer.deals || customer.deals.length === 0) && <tr><td colSpan="3" className="text-center">No deals found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        {totalDealPages > 1 && (
                            <div className="card-footer d-flex justify-content-center">
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${currentDealPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentDealPage(p => p - 1)}>Previous</button>
                                        </li>
                                        <li className="page-item disabled"><span className="page-link">{currentDealPage} of {totalDealPages}</span></li>
                                        <li className={`page-item ${currentDealPage === totalDealPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentDealPage(p => p + 1)}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                    <div className="card shadow-sm mt-4">
                        <div className="card-header"><h5>Attachments</h5></div>
                        <ul className="list-group list-group-flush">
                            {customer.attachments && customer.attachments.map(file => (
                                <li key={file.id} className="list-group-item"><a href={file.file_url} target="_blank" rel="noopener noreferrer"><i className="fas fa-file-alt me-2"></i>{file.file_name}</a></li>
                            ))}
                            {(!customer.attachments || customer.attachments.length === 0) && <li className="list-group-item">No attachments found.</li>}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Conditionally render the new deal detail modal */}
            {selectedDeal && <ReadOnlyDealModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />}
        </div>
    );
}

export default CustomerDetailPage;