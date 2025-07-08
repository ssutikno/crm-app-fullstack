import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CustomerFormModal from '../components/CustomerFormModal'; // Import the new modal

function CustomersPage() {
    const { user, loadingAuth } = useAuth();
    const [allCustomers, setAllCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // State for the modal
    const [modalMode, setModalMode] = useState(null); // 'create' or 'edit'
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(`${apiUrl}/api/customers`);
                setAllCustomers(response.data);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const processedCustomers = useMemo(() => {
        let filteredData = [...allCustomers];
        if (searchTerm) {
            filteredData = filteredData.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.industry && customer.industry.toLowerCase().includes(searchTerm.toLowerCase()))
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
    }, [allCustomers, searchTerm, sortConfig]);
    
    const totalPages = Math.ceil(processedCustomers.length / itemsPerPage);
    const paginatedCustomers = processedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };
    
    const handleDelete = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const headers = { 'x-user-id': user.id, 'x-user-role': user.role };
                await axios.delete(`${apiUrl}/api/customers/${customerId}`, { headers });
                setAllCustomers(prev => prev.filter(c => c.id !== customerId));
            } catch (error) {
                alert(error.response?.data?.msg || 'Failed to delete customer.');
            }
        }
    };

    const handleSave = async (formData) => {
        const apiUrl = process.env.REACT_APP_API_URL;
        const headers = { 'x-user-id': user.id, 'x-user-role': user.role };

        try {
            if (modalMode === 'create') {
                const { data: newCustomer } = await axios.post(`${apiUrl}/api/customers`, formData, { headers });
                setAllCustomers(prev => [...prev, newCustomer]);
            } else if (modalMode === 'edit') {
                const { data: updatedCustomer } = await axios.put(`${apiUrl}/api/customers/${selectedCustomer.id}`, formData, { headers });
                setAllCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
            }
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to save customer.');
        } finally {
            setModalMode(null);
            setSelectedCustomer(null);
        }
    };

    if (loadingAuth || loading) return <p>Loading...</p>;
    if (!user) return <div className="alert alert-danger">Could not load user data. Permissions cannot be checked.</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h1>Customers</h1>
                <button className="btn btn-primary" onClick={() => setModalMode('create')}>
                    <i className="fas fa-plus me-2"></i>Add New Customer
                </button>
            </div>
            <p className="lead">Manage your existing customer accounts.</p>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search customers..."
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="card shadow-sm mt-4">
                <div className="card-body">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>Customer Name ▾</th>
                                <th onClick={() => requestSort('industry')} style={{ cursor: 'pointer' }}>Industry ▾</th>
                                <th onClick={() => requestSort('city')} style={{ cursor: 'pointer' }}>City ▾</th>
                                <th>Website</th>
                                <th onClick={() => requestSort('owner_name')} style={{ cursor: 'pointer' }}>Owner ▾</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.industry}</td>
                                    <td>{customer.city}</td>
                                    <td><a href={customer.website} target="_blank" rel="noopener noreferrer">{customer.website}</a></td>
                                    <td>{customer.owner_name}</td>
                                    <td>
                                        <Link to={`/customers/${customer.id}`} className="btn btn-sm btn-outline-secondary me-1" title="View Details">
                                            <i className="fas fa-eye"></i>
                                        </Link>
                                        
                                        {(user.id === customer.owner_id || user.role === 'sales_manager') && (
                                            <button className="btn btn-sm btn-outline-primary me-1" title="Edit" onClick={() => { setSelectedCustomer(customer); setModalMode('edit'); }}>
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                        )}

                                        {user.role === 'supervisor' && (
                                            <button onClick={() => handleDelete(customer.id)} className="btn btn-sm btn-outline-danger" title="Delete">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-3">
                <nav>
                    <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                        </li>
                    </ul>
                </nav>
                
                <div className="d-flex align-items-center">
                    <span className="me-2 text-muted">Page {currentPage} of {totalPages}</span>
                    <select className="form-select w-auto" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                    </select>
                </div>
            </div>

            <CustomerFormModal 
                mode={modalMode} 
                customer={selectedCustomer} 
                onClose={() => { setModalMode(null); setSelectedCustomer(null); }}
                onSave={handleSave}
            />
        </div>
    );
}

export default CustomersPage;