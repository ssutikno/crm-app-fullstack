import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone'; // Import the useDropzone hook

function ProductRequestFormModal({ deal, onClose }) {
    const [requestedProductName, setRequestedProductName] = useState('');
    const [specs, setSpecs] = useState('');
    const [files, setFiles] = useState([]); // State will now hold an array of file objects

    // Setup the onDrop callback function for react-dropzone
    const onDrop = useCallback(acceptedFiles => {
        // Append new files to the existing list
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }, []);

    // Get props from the useDropzone hook
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleSave = async () => {
        if (!requestedProductName || !specs) {
            alert('Please fill out the product name and specifications.');
            return;
        }

        const formData = new FormData();
        formData.append('deal_id', deal.id);
        formData.append('requested_product_name', requestedProductName);
        formData.append('specs', specs);

        if (files.length > 0) {
            files.forEach(file => {
                formData.append('attachments', file);
            });
        }

        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.post(`${apiUrl}/api/product-requests`, formData);
            alert('Product request submitted successfully!');
            onClose();
        } catch (error) {
            console.error("Failed to submit product request:", error);
            alert('Error submitting request.');
        }
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };
    
    // Style for the dropzone area
    const dropzoneStyle = {
        border: '2px dashed #007bff',
        borderRadius: '.25rem',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#e9ecef' : '#fff'
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header"><h5 className="modal-title">Request New Product</h5><button type="button" className="btn-close" onClick={onClose}></button></div>
                    <div className="modal-body">
                        <p>For Deal: <strong>{deal.name}</strong></p>
                        <div className="mb-3"><label className="form-label">Requested Product Name</label><input type="text" className="form-control" value={requestedProductName} onChange={e => setRequestedProductName(e.target.value)} required/></div>
                        <div className="mb-3"><label className="form-label">Specifications / Requirements</label><textarea className="form-control" rows="4" value={specs} onChange={e => setSpecs(e.target.value)} required></textarea></div>
                        
                        {/* NEW: Drag and drop area */}
                        <div className="mb-3">
                            <label className="form-label">Attachments</label>
                            <div {...getRootProps()} style={dropzoneStyle}>
                                <input {...getInputProps()} />
                                {
                                    isDragActive ?
                                    <p>Drop the files here ...</p> :
                                    <p>Drag 'n' drop some files here, or click to select files</p>
                                }
                            </div>
                        </div>

                        {/* NEW: List of selected files */}
                        {files.length > 0 && (
                             <ul className="list-group">
                                {files.map(file => (
                                    <li key={file.name} className="list-group-item d-flex justify-content-between align-items-center">
                                        {file.name} - {(file.size / 1024).toFixed(2)} KB
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeFile(file.name)}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" onClick={handleSave}>Submit Request</button></div>
                </div>
            </div>
        </div>
    );
}

export default ProductRequestFormModal;