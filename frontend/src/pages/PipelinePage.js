import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PipelineColumn } from '../components/PipelineColumn';
import DealDetailModal from '../components/DealDetailModal';

const columnOrder = ['new', 'qualifying', 'proposal', 'won', 'lost'];

function PipelinePage() {
    const [dealColumns, setDealColumns] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDeal, setSelectedDeal] = useState(null);

    // const columnOrder = ['new', 'qualifying', 'proposal', 'won', 'lost'];

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const response = await axios.get(`${apiUrl}/api/deals`);
                
                const initialColumns = {};
                columnOrder.forEach(col => initialColumns[col] = []);

                const populatedColumns = { ...initialColumns, ...response.data };
                setDealColumns(populatedColumns);
            } catch (error) {
                console.error("Failed to fetch deals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    const handleStageChangeOnModal = async (dealToMove, newStageName) => {
        const originalStageName = dealToMove.stage_name;
        if (originalStageName === newStageName) return;

        setDealColumns(prev => {
            const newSourceItems = prev[originalStageName].filter(d => d.id !== dealToMove.id);
            const newDestItems = [...prev[newStageName], { ...dealToMove, stage_name: newStageName }];
            return {
                ...prev,
                [originalStageName]: newSourceItems,
                [newStageName]: newDestItems,
            };
        });

        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.put(`${apiUrl}/api/deals/${dealToMove.id}/stage`, { newStage: newStageName });
        } catch (error) {
            console.error("Failed to update deal stage:", error);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = active.data.current?.sortable.containerId;
        const overContainer = over.data.current?.sortable.containerId || over.id;

        if (!activeContainer || !overContainer) return;

        if (activeContainer === overContainer) {
            // Logic for re-sorting within the same column
            setDealColumns(prev => {
                const columnItems = prev[activeContainer];
                const oldIndex = columnItems.findIndex(d => d.id === activeId);
                const newIndex = columnItems.findIndex(d => d.id === overId);
                return {
                    ...prev,
                    [activeContainer]: arrayMove(columnItems, oldIndex, newIndex)
                };
            });
        } else {
            // Logic for moving between different columns
            const dealId = activeId;
            const newStage = overContainer;

            setDealColumns(prev => {
                const sourceColumn = prev[activeContainer];
                const destColumn = prev[overContainer];

                if (!sourceColumn || !destColumn) return prev;

                const dealToMove = sourceColumn.find(d => d.id === dealId);
                if (!dealToMove) return prev;
                
                const updatedDealToMove = { ...dealToMove, stage_name: newStage };

                return {
                    ...prev,
                    [activeContainer]: sourceColumn.filter(d => d.id !== dealId),
                    [overContainer]: [...destColumn, updatedDealToMove],
                };
            });

            axios.put(`${process.env.REACT_APP_API_URL}/api/deals/${dealId}/stage`, { newStage })
                .catch(error => console.error("Failed to update deal stage:", error));
        }
    };

    if (loading) return <p>Loading pipeline...</p>;

    return (
        <div>
            <h1 className="mt-4">Visual Sales Pipeline</h1>
            <p className="lead">Drag and drop opportunities to update their stage. Click on a card to view details.</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="d-flex overflow-auto pb-3">
                    {columnOrder.map(columnId => (
                        <PipelineColumn 
                            key={columnId} 
                            id={columnId} 
                            title={columnId.replace('_', ' ').toUpperCase()} 
                            deals={dealColumns[columnId]}
                            onCardClick={(deal) => setSelectedDeal(deal)}
                        />
                    ))}
                </div>
            </DndContext>

            {selectedDeal && (
                <DealDetailModal 
                    deal={selectedDeal} 
                    onClose={() => setSelectedDeal(null)} 
                    onStageChange={handleStageChangeOnModal}
                />
            )}
        </div>
    );
}

export default PipelinePage;