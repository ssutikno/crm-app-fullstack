import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LeadFormModal from '../components/LeadFormModal';

function LeadsPage() {
    const [allLeads, setAllLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // State for modals
    const [modalMode, setModalMode] = useState(null); // 'create' or 'edit'
    const [selectedLead, setSelectedLead] = useState(null);

    // State for table controls
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            console.log("Fetching leads from API...");
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.get(`${apiUrl}/api/leads`);
            console.log("Leads fetched successfully:", response.data);
            setAllLeads(response.data);
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleSave = async (formData) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            if (modalMode === 'create') {
                await axios.post(`${apiUrl}/api/leads`, formData);
            } else if (modalMode === 'edit') {
                await axios.put(`${apiUrl}/api/leads/${selectedLead.id}`, formData);
            }
            fetchLeads(); // Refresh the list
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.msg || 'Failed to save lead.';
            alert(msg);
        } finally {
            setModalMode(null);
        }
    };

    const handleDelete = async (leadId) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/leads/${leadId}`);
                fetchLeads(); // Refresh the list
            } catch (error) {
                alert('Failed to delete lead.');
            }
        }
    };

    const handleConvert = async (lead) => {
        const dealName = prompt("Please enter a name for the new deal:", `${lead.company} - Opportunity`);
        if (!dealName) return;
        const dealValue = prompt("Enter an initial value for this deal:", "5000");
        if (!dealValue || isNaN(dealValue)) {
            alert("Please enter a valid number for the deal value.");
            return;
        };

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/leads/${lead.id}/convert`, { dealName, dealValue: Number(dealValue) });
            alert('Lead converted successfully!');
            fetchLeads(); // Refresh the list to show the "Converted" status
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.msg || 'Failed to convert lead.';
            alert(msg);
        }
    };

    // --- Data Processing ---
    const processedLeads = useMemo(() => {
        let filteredData = [...allLeads];

        if (searchTerm) {
            filteredData = filteredData.filter(lead =>
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (sortConfig.key !== null) {
            filteredData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredData;
    }, [allLeads, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedLeads.length / itemsPerPage);
    const paginatedLeads = processedLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };
    
    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    if (loading) return <p>Loading leads...</p>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h1>Lead Management</h1>
                <button className="btn btn-primary" onClick={() => setModalMode('create')}><i className="fas fa-plus me-2"></i>Add New Lead</button>
            </div>
            <p className="lead">Prioritize and manage potential customers.</p>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search leads..."
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="card shadow-sm mt-4">
                <div className="card-body">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>Name ▾</th>
                                <th onClick={() => requestSort('company')} style={{ cursor: 'pointer' }}>Company ▾</th>
                                <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>Status ▾</th>
                                <th onClick={() => requestSort('owner_name')} style={{ cursor: 'pointer' }}>Owner ▾</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLeads.map(lead => {
                                const canManage = user.id === lead.owner_id || ['sales_manager', 'supervisor'].includes(user.role);
                                return (
                                    <tr key={lead.id}>
                                        <td>{lead.name}</td>
                                        <td>{lead.company}</td>
                                        <td><span className={`badge bg-${lead.status === 'Converted' ? 'success' : 'primary'}`}>{lead.status}</span></td>
                                        <td>{lead.owner_name}</td>
                                        <td>
                                            {canManage && (
                                                <>
                                                    {lead.status !== 'Converted' && (
                                                        <button className="btn btn-sm btn-outline-success me-1" title="Convert Lead" onClick={() => handleConvert(lead)}>
                                                            <i className="fas fa-exchange-alt"></i>
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-outline-primary me-1" title="Edit" onClick={() => { setModalMode('edit'); setSelectedLead(lead); }}>
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(lead.id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-3">
                <nav>
                    <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Previous</button></li>
                        <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Next</button></li>
                    </ul>
                </nav>
                <div className="d-flex align-items-center">
                    <span className="me-2 text-muted">Page {currentPage} of {totalPages}</span>
                    <select className="form-select w-auto" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value="10">10 per page</option><option value="25">25 per page</option><option value="50">50 per page</option><option value="100">100 per page</option>
                    </select>
                </div>
            </div>

            {modalMode && <LeadFormModal mode={modalMode} lead={selectedLead} onClose={() => setModalMode(null)} onSave={handleSave} />}
        </div>
    );
}

export default LeadsPage;