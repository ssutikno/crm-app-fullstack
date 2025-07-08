import React from 'react';

function ReadOnlyDealModal({ deal, onClose }) {
    if (!deal) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Deal Details</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <h4>{deal.name}</h4>
                        <div className="row mt-3">
                            <div className="col-md-6">
                                <p><strong>Stage:</strong> <span className="badge bg-primary">{deal.stage_name}</span></p>
                                <p><strong>Value:</strong> ${deal.value.toLocaleString()}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Close Date:</strong> {new Date(deal.close_date).toLocaleDateString()}</p>
                                <p><strong>Created On:</strong> {new Date(deal.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReadOnlyDealModal;