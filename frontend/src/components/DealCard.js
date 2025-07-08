import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const DealCard = ({ deal, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        // The main div is now only for positioning
        <div ref={setNodeRef} style={style} className="card bg-light mb-3">
            {/* The onClick handler is now on the card-body */}
            <div className="card-body" onClick={onClick} style={{ cursor: 'pointer' }}>
                <div className="d-flex justify-content-between">
                    <h6 className="card-title">{deal.name}</h6>
                    {/* The drag handle now has all the drag-related listeners and attributes */}
                    <span {...listeners} {...attributes} style={{ cursor: 'grab', padding: '0 5px' }}>
                        <i className="fas fa-grip-vertical"></i>
                    </span>
                </div>
                <p className="card-text small text-muted">{deal.company || 'N/A'}</p>
                <p className="card-text fw-bold">${deal.value.toLocaleString()}</p>
            </div>
        </div>
    );
};