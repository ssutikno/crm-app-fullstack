import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskFormModal from '../components/TaskFormModal';

function TasksPage() {
    // --- State Management ---
    const [allTasks, setAllTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false); 
    
    // New state for UI controls
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'overdue', or 'completed'
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Data Fetching ---
    const fetchTasks = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.get(`${apiUrl}/api/tasks`);
            setAllTasks(response.data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);
    
    const handleSaveTask = async (taskData) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.post(`${apiUrl}/api/tasks`, taskData);
            setIsModalOpen(false); // Close modal on success
            fetchTasks(); // Refresh the list
        } catch (error) {
            console.error("Failed to save task:", error);
            alert("Error saving task.");
        }
    };


    // --- Event Handlers ---
    const handleStatusChange = async (task, newStatus) => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.put(`${apiUrl}/api/tasks/${task.id}/status`, { status: newStatus });
            fetchTasks(); // Refresh the list
        } catch (error) {
            console.error("Failed to update task status:", error);
        }
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setCurrentPage(1); // Reset to first page when changing tabs
    };

    // --- Data Processing (Search, Group, Paginate) ---
    const processedData = useMemo(() => {
        // 1. Filter tasks by search term first
        const searchedTasks = allTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Group the filtered tasks
        const groups = { overdue: [], upcoming: [], completed: [] };
        const today = new Date().setHours(0, 0, 0, 0);
        searchedTasks.forEach(task => {
            if (task.status === 'completed') {
                groups.completed.push(task);
            } else {
                const dueDate = new Date(task.due_date).setHours(0, 0, 0, 0);
                if (dueDate < today) {
                    groups.overdue.push(task);
                } else {
                    groups.upcoming.push(task);
                }
            }
        });

        // 3. Paginate the tasks for the currently active tab
        const activeTasks = groups[activeTab] || [];
        const totalPages = Math.ceil(activeTasks.length / itemsPerPage);
        const paginatedTasks = activeTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return { paginatedTasks, totalPages, taskCounts: {
            upcoming: groups.upcoming.length,
            overdue: groups.overdue.length,
            completed: groups.completed.length
        }};
    }, [allTasks, searchTerm, activeTab, currentPage]);


    if (loading) return <p>Loading tasks...</p>;

    // --- Render ---
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4">
                <h1>Tasks & Activities</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><i className="fas fa-plus me-2"></i>Add New Task</button>
            </div>
            
            <div className="row mt-3">
                <div className="col-md-6">
                     <p className="lead">Manage tasks assigned to {user?.role === 'sales' ? 'you' : 'the team'}.</p>
                </div>
                 <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search tasks..."
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mt-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => handleTabClick('upcoming')}>
                        Upcoming <span className="badge bg-primary ms-1">{processedData.taskCounts.upcoming}</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'overdue' ? 'active' : ''}`} onClick={() => handleTabClick('overdue')}>
                        Overdue <span className="badge bg-danger ms-1">{processedData.taskCounts.overdue}</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => handleTabClick('completed')}>
                        Completed <span className="badge bg-success ms-1">{processedData.taskCounts.completed}</span>
                    </button>
                </li>
            </ul>

            {/* Task List */}
            <div className="list-group mt-3">
                {processedData.paginatedTasks.length > 0 ? processedData.paginatedTasks.map(task => (
                    <div key={task.id} className="list-group-item list-group-item-action">
                        <div className="d-flex w-100 justify-content-between">
                            <h5 className="mb-1">{task.title}</h5>
                            <small>Due: {new Date(task.due_date).toLocaleDateString()}</small>
                        </div>
                        <p className="mb-1 text-muted">
                            {task.deal_name && <span>Deal: <Link to={`#`}>{task.deal_name}</Link></span>}
                            {task.customer_name && <span>Customer: <Link to={`/customers/${task.customer_id}`}>{task.customer_name}</Link></span>}
                        </p>
                        {task.status !== 'completed' && (
                            <button className="btn btn-sm btn-outline-success" onClick={() => handleStatusChange(task, 'completed')}>
                                <i className="fas fa-check"></i> Mark Complete
                            </button>
                        )}
                    </div>
                )) : <div className="list-group-item">No tasks in this category.</div>}
            </div>

            {/* Pagination Controls */}
            {processedData.totalPages > 1 && (
                 <nav className="mt-3 d-flex justify-content-center">
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
                        </li>
                         <li className="page-item disabled"><span className="page-link">Page {currentPage} of {processedData.totalPages}</span></li>
                        <li className={`page-item ${currentPage === processedData.totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                        </li>
                    </ul>
                </nav>
            )}
            {/* Render the modal */}
            <TaskFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
            />

        </div>
    );
}

export default TasksPage;