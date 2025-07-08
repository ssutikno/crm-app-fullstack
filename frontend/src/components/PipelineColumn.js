import React from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from './DealCard';

export const PipelineColumn = ({ id, title, deals = [], onCardClick }) => {
    const { setNodeRef } = useSortable({ id });

    return (
        <div className="flex-shrink-0" style={{ width: '280px', marginRight: '1rem' }}>
            <div className="card bg-light">
                <div className="card-header fw-bold">{title}</div>
                <div ref={setNodeRef} className="card-body" style={{ minHeight: '400px' }}>
                    <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                        {deals.map(deal => (
                            <DealCard 
                                key={deal.id} 
                                deal={deal} 
                                // Pass the click handler to each card
                                onClick={() => onCardClick(deal)} 
                            />
                        ))}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
};