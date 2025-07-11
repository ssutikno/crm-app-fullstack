import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import PipelinePage from './pages/PipelinePage';
import ProductsPage from './pages/ProductsPage';
import ProductRequestsPage from './pages/ProductRequestsPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import QuotesListPage from './pages/QuotesListPage';
import NewQuotePage from './pages/NewQuotePage';
import TasksPage from './pages/TasksPage'; // This import should now work
import UserManagementPage from './pages/UserManagementPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage'; // Import the new Analytics page

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup/:userId" element={<SetupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="quotes" element={<QuotesListPage />} />
          <Route path="quotes/new" element={<NewQuotePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          <Route path="product-requests" element={<ProductRequestsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} /> {/* Add the Analytics page route */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;