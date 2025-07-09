import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProductFormModal from '../components/ProductFormModal';
import ProductDetailModal from '../components/ProductDetailModal';

function ProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for all table controls
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);

    // State for modals
    const [modalMode, setModalMode] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // State to trigger a data refetch
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(`${apiUrl}/api/products`, {
                    params: { 
                        search: searchTerm, 
                        category: category,
                        sortBy: sortConfig.key,
                        direction: sortConfig.direction,
                        page: currentPage,
                        limit: itemsPerPage
                    }
                });
                setProducts(response.data.products);
                setTotalProducts(response.data.totalCount);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce fetching to avoid excessive API calls
        const timerId = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(timerId);
    }, [searchTerm, category, sortConfig, currentPage, itemsPerPage, refetchTrigger]);

    const handleSave = async (formData) => {
        const apiUrl = process.env.REACT_APP_API_URL;
        try {
            if (modalMode === 'create') {
                await axios.post(`${apiUrl}/api/products`, formData);
            } else if (modalMode === 'edit') {
                await axios.put(`${apiUrl}/api/products/${selectedProduct.id}`, formData);
            }
            setRefetchTrigger(c => c + 1); // Trigger a refetch
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to save product.');
        } finally {
            setModalMode(null);
            setSelectedProduct(null);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                await axios.delete(`${apiUrl}/api/products/${productId}`);
                setRefetchTrigger(c => c + 1); // Trigger a refetch
            } catch (error) {
                alert(error.response?.data?.msg || 'Failed to delete product.');
            }
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const canManageProducts = user && ['product_manager', 'supervisor'].includes(user.role);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h1>Product Catalog</h1>
                {canManageProducts && (
                    <button className="btn btn-primary" onClick={() => setModalMode('create')}>
                        <i className="fas fa-plus me-2"></i>Add New Product
                    </button>
                )}
            </div>
            <p className="lead">Search and browse all available products and services.</p>

            <div className="row mb-3">
                <div className="col-md-6"><input type="text" className="form-control" placeholder="Search by name or SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                <div className="col-md-4">
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="Workstations">Workstations</option>
                        <option value="Laptops">Laptops</option>
                        <option value="Services">Services</option>
                        <option value="Servers">Servers</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Monitors">Monitors</option>
                        <option value="Hardware">Hardware</option>
                    </select>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header"><h5 className="mb-0">Product List</h5></div>
                <div className="card-body">
                    {loading ? <p>Loading products...</p> : (
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th onClick={() => requestSort('sku')} style={{cursor: 'pointer'}}>SKU ▾</th>
                                    <th onClick={() => requestSort('name')} style={{cursor: 'pointer'}}>Name ▾</th>
                                    <th onClick={() => requestSort('category')} style={{cursor: 'pointer'}}>Category ▾</th>
                                    <th onClick={() => requestSort('price')} style={{cursor: 'pointer'}}>Price ▾</th>
                                    <th onClick={() => requestSort('status')} style={{cursor: 'pointer'}}>Status ▾</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.sku}</td>
                                        <td>{product.name}</td>
                                        <td>{product.category}</td>
                                        <td>${product.price}</td>
                                        <td><span className="badge bg-success">{product.status}</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-1" title="View Details" onClick={() => { setSelectedProduct(product); setModalMode('view'); }}>
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            {canManageProducts && (
                                                <>
                                                    <button className="btn btn-sm btn-outline-primary me-1" title="Edit" onClick={() => { setSelectedProduct(product); setModalMode('edit'); }}>
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="btn btn-sm btn-outline-danger" title="Delete">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
                    <span className="me-2 text-muted">Page {currentPage} of {totalPages} ({totalProducts} items)</span>
                    <select className="form-select w-auto" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value="10">10 per page</option><option value="25">25 per page</option><option value="50">50 per page</option>
                    </select>
                </div>
            </div>

            {(modalMode === 'edit' || modalMode === 'create') && (
                <ProductFormModal 
                    mode={modalMode} 
                    product={selectedProduct} 
                    onClose={() => { setModalMode(null); setSelectedProduct(null); }}
                    onSave={handleSave}
                />
            )}

            {modalMode === 'view' && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setModalMode(null)}
                />
            )}
        </div>
    );
}

export default ProductsPage;